import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import * as bcrypt from 'bcrypt';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { ILike, IsNull, type FindOptionsWhere, type Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 } from 'uuid';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { shouldRefreshApplicationRegistrationOnInstall } from 'src/engine/core-modules/application/application-install/utils/should-refresh-application-registration-on-install.util';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';
import { MARKETPLACE_BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-billing-exempt-applications.constant';
import { MARKETPLACE_VETTED_APPLICATIONS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-vetted-applications.constant';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { type ApplicationRegistrationInstalledWorkspacesDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-installed-workspaces.dto';
import { type ApplicationRegistrationStatsDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-stats.dto';
import { type ClaimableApplicationRegistrationDTO } from 'src/engine/core-modules/application/application-registration/dtos/claimable-application-registration.dto';
import { type CreateApplicationRegistrationInput } from 'src/engine/core-modules/application/application-registration/dtos/create-application-registration.input';
import { type PaginatedApplicationRegistrationsDTO } from 'src/engine/core-modules/application/application-registration/dtos/paginated-application-registrations.dto';
import { type PublicApplicationRegistrationDTO } from 'src/engine/core-modules/application/application-registration/dtos/public-application-registration.dto';
import {
  type UpdateApplicationRegistrationInput,
  type UpdateApplicationRegistrationPayload,
} from 'src/engine/core-modules/application/application-registration/dtos/update-application-registration.input';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { buildRegistrationManifestUpdateFields } from 'src/engine/core-modules/application/application-registration/utils/build-registration-manifest-update-fields.util';
import { fromManifestApplicationToDisplayFields } from 'src/engine/core-modules/application/application-registration/utils/from-manifest-application-to-display-fields.util';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  UPGRADE_APPLICATIONS_JOB_NAME,
  type UpgradeApplicationsJobData,
} from 'src/engine/core-modules/application/jobs/upgrade-applications.job-constants';
import { validateRedirectUri } from 'src/engine/core-modules/auth/utils/validate-redirect-uri.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const BCRYPT_SALT_ROUNDS = 10;

const MAX_APPLICATION_REGISTRATIONS_PAGE_SIZE = 100;

const APPLICATION_REGISTRATION_UPDATE_LOCK_OPTIONS = {
  ttl: 60_000,
  ms: 500,
  maxRetries: 120,
};

const APPLICATION_REGISTRATION_WITHOUT_MANIFEST_SELECT: (keyof ApplicationRegistrationEntity)[] =
  [
    'id',
    'universalIdentifier',
    'name',
    'oAuthClientId',
    'oAuthRedirectUris',
    'oAuthScopes',
    'createdByUserId',
    'ownerWorkspaceId',
    'sourceType',
    'sourcePackage',
    'tarballFileId',
    'latestAvailableVersion',
    'isListed',
    'isVetted',
    'isPreInstalled',
    'hasFreeLogicFunctionExecutions',
    'logo',
    'logoFileId',
    'description',
    'author',
    'category',
    'websiteUrl',
    'aboutDescription',
    'termsUrl',
    'emailSupport',
    'issueReportUrl',
    'screenshots',
    'galleryImages',
    'createdAt',
    'updatedAt',
  ];

export type ApplicationRegistrationCatalogCard = {
  id: string;
  universalIdentifier: string;
  name: string;
  sourcePackage: string | null;
  isVetted: boolean;
  description: string | null;
  author: string | null;
  category: string | null;
  logoUrl: string | null;
};

@Injectable()
export class ApplicationRegistrationService {
  private readonly logger = new Logger(ApplicationRegistrationService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    private readonly applicationRegistrationAssetUrlService: ApplicationRegistrationAssetUrlService,
    private readonly serverFileStorageService: ServerFileStorageService,
    private readonly cacheLockService: CacheLockService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly metricsService: MetricsService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly workspaceQueueService: MessageQueueService,
  ) {}

  // Best-effort: a queue outage must not fail the publish flow that
  // triggered the upgrade.
  async enqueueAutoUpgradeApplications(
    applicationRegistrationId: string,
  ): Promise<void> {
    try {
      await this.workspaceQueueService.add<UpgradeApplicationsJobData>(
        UPGRADE_APPLICATIONS_JOB_NAME,
        { applicationRegistrationId, onlyAutoUpgrade: true },
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue auto-upgrade for registration ${applicationRegistrationId}`,
        error,
      );
    }
  }

  private async invalidateMarketplaceAppsCache(): Promise<void> {
    try {
      await this.coreEntityCacheService.invalidate(
        'marketplaceCatalog',
        MARKETPLACE_CATALOG_CACHE_ENTITY_ID,
      );
    } catch (error) {
      this.logger.error('Failed to invalidate marketplace apps cache', error);
    }
  }

  emitRegistrationPublishMetric({
    isNewRegistration,
    universalIdentifier,
    name,
    sourceType,
    version,
  }: {
    isNewRegistration: boolean;
    universalIdentifier: string;
    name: string;
    sourceType: string;
    version?: string | null;
  }): void {
    this.metricsService.incrementCounterBy({
      key: isNewRegistration
        ? MetricsKeys.AppRegistrationCreated
        : MetricsKeys.AppRegistrationVersionPublished,
      amount: 1,
      attributes: {
        universal_identifier: universalIdentifier,
        app_name: name,
        source_type: sourceType,
        version: version ?? 'unknown',
      },
    });
  }

  async setLatestAvailableVersionIfChanged(
    applicationRegistrationId: string,
    newVersion: string | null,
  ): Promise<boolean> {
    const result = await this.applicationRegistrationRepository
      .createQueryBuilder()
      .update(ApplicationRegistrationEntity)
      .set({ latestAvailableVersion: newVersion })
      .where('id = :id', { id: applicationRegistrationId })
      .andWhere('"latestAvailableVersion" IS DISTINCT FROM :newVersion', {
        newVersion,
      })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  async findMany(
    ownerWorkspaceId: string,
  ): Promise<ApplicationRegistrationEntity[]> {
    return this.applicationRegistrationRepository.find({
      select: APPLICATION_REGISTRATION_WITHOUT_MANIFEST_SELECT,
      where: { ownerWorkspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll({
    limit,
    offset,
    searchTerm,
    isPreInstalledOnly,
  }: {
    limit: number;
    offset: number;
    searchTerm?: string;
    isPreInstalledOnly?: boolean;
  }): Promise<PaginatedApplicationRegistrationsDTO> {
    const safeLimit = Math.min(
      Math.max(limit, 1),
      MAX_APPLICATION_REGISTRATIONS_PAGE_SIZE,
    );
    const safeOffset = Math.max(offset, 0);

    const trimmedSearch = searchTerm?.trim();

    const queryBuilder = this.applicationRegistrationRepository
      .createQueryBuilder('registration')
      .select(
        APPLICATION_REGISTRATION_WITHOUT_MANIFEST_SELECT.map(
          (column) => `registration.${column}`,
        ),
      )
      .orderBy('registration.createdAt', 'DESC')
      .addOrderBy('registration.id', 'ASC')
      .skip(safeOffset)
      .take(safeLimit);

    if (isPreInstalledOnly === true) {
      queryBuilder.andWhere('registration."isPreInstalled" = true');
    }

    if (isDefined(trimmedSearch) && trimmedSearch.length > 0) {
      queryBuilder.andWhere(
        `(registration.name ILIKE :searchTerm
          OR registration."sourcePackage" ILIKE :searchTerm
          OR registration."universalIdentifier"::text ILIKE :searchTerm)`,
        { searchTerm: `%${trimmedSearch}%` },
      );
    }

    const [registrations, totalCount] = await queryBuilder.getManyAndCount();

    return {
      registrations,
      totalCount,
      hasMore: safeOffset + registrations.length < totalCount,
    };
  }

  async findOneById(
    id: string,
    ownerWorkspaceId: string,
  ): Promise<ApplicationRegistrationEntity> {
    const registration = await this.applicationRegistrationRepository.findOne({
      select: APPLICATION_REGISTRATION_WITHOUT_MANIFEST_SELECT,
      where: { id, ownerWorkspaceId },
    });

    if (!registration) {
      throw new ApplicationRegistrationException(
        `Application registration with id ${id} not found`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    return registration;
  }

  async findOneByIdGlobal(id: string): Promise<ApplicationRegistrationEntity> {
    const registration = await this.applicationRegistrationRepository.findOne({
      select: APPLICATION_REGISTRATION_WITHOUT_MANIFEST_SELECT,
      where: { id },
    });

    if (!registration) {
      throw new ApplicationRegistrationException(
        `Application registration with id ${id} not found`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    return registration;
  }

  // Global lookup — used by OAuth flow (no workspace scoping)
  async findOneByClientId(
    clientId: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    return this.applicationRegistrationRepository.findOne({
      where: { oAuthClientId: clientId },
    });
  }

  // Global lookup — used by OAuth authorize page (no workspace scoping)
  async findPublicByClientId(
    clientId: string,
  ): Promise<PublicApplicationRegistrationDTO | null> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { oAuthClientId: clientId },
      select: [
        'id',
        'name',
        'logo',
        'logoFileId',
        'sourceType',
        'sourcePackage',
        'latestAvailableVersion',
        'websiteUrl',
        'oAuthScopes',
      ],
    });

    if (!registration) {
      return null;
    }

    return {
      id: registration.id,
      name: registration.name,
      logoUrl:
        this.applicationRegistrationAssetUrlService.buildLogoUrl(registration),
      websiteUrl: registration.websiteUrl,
      oAuthScopes: registration.oAuthScopes,
    };
  }

  async findOneByUniversalIdentifier(
    universalIdentifier: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    return this.applicationRegistrationRepository.findOne({
      where: { universalIdentifier },
    });
  }

  async create(
    input: CreateApplicationRegistrationInput,
    ownerWorkspaceId: string,
    createdByUserId: string | null,
  ): Promise<{
    applicationRegistration: ApplicationRegistrationEntity;
    clientSecret: string;
  }> {
    const universalIdentifier = input.universalIdentifier ?? v4();

    const existingByUid =
      await this.findOneByUniversalIdentifier(universalIdentifier);

    if (existingByUid) {
      throw new ApplicationRegistrationException(
        `Universal identifier ${universalIdentifier} is already claimed`,
        ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED,
      );
    }

    if (isDefined(input.oAuthRedirectUris)) {
      this.validateRedirectUris(input.oAuthRedirectUris);
    }

    if (isDefined(input.oAuthScopes)) {
      this.validateScopes(input.oAuthScopes);
    }

    const clientId = v4();
    const { clientSecret, clientSecretHash } =
      await this.generateClientSecret();

    const applicationRegistration =
      this.applicationRegistrationRepository.create({
        universalIdentifier,
        name: input.name,
        oAuthClientId: clientId,
        oAuthClientSecretHash: clientSecretHash,
        oAuthRedirectUris: input.oAuthRedirectUris ?? [],
        oAuthScopes: input.oAuthScopes ?? [],
        createdByUserId,
        ownerWorkspaceId,
      });

    const saved = await this.applicationRegistrationRepository.save(
      applicationRegistration,
    );

    await this.invalidateMarketplaceAppsCache();

    return { applicationRegistration: saved, clientSecret };
  }

  async update(
    input: UpdateApplicationRegistrationInput,
    ownerWorkspaceId: string,
  ): Promise<ApplicationRegistrationEntity> {
    const { id, update } = input;

    await this.findOneById(id, ownerWorkspaceId);
    // Workspace-scoped path: tenants must not be able to grant their own apps
    // free logic-function executions, so the billing exemption is admin-only.
    await this.applyUpdate(id, update, { allowBillingExemption: false });

    return this.findOneById(id, ownerWorkspaceId);
  }

  async updateGlobal(
    input: UpdateApplicationRegistrationInput,
  ): Promise<ApplicationRegistrationEntity> {
    const { id, update } = input;

    await this.findOneByIdGlobal(id);
    await this.applyUpdate(id, update, { allowBillingExemption: true });

    return this.findOneByIdGlobal(id);
  }

  private async applyUpdate(
    id: string,
    update: UpdateApplicationRegistrationPayload,
    { allowBillingExemption }: { allowBillingExemption: boolean },
  ): Promise<void> {
    if (isDefined(update.oAuthRedirectUris)) {
      this.validateRedirectUris(update.oAuthRedirectUris);
    }

    if (isDefined(update.oAuthScopes)) {
      this.validateScopes(update.oAuthScopes);
    }

    const updateData: Record<string, unknown> = {};

    if (isDefined(update.name)) updateData.name = update.name;
    if (isDefined(update.oAuthRedirectUris))
      updateData.oAuthRedirectUris = update.oAuthRedirectUris;
    if (isDefined(update.oAuthScopes))
      updateData.oAuthScopes = update.oAuthScopes;
    if (isDefined(update.isListed)) updateData.isListed = update.isListed;
    if (isDefined(update.isPreInstalled))
      updateData.isPreInstalled = update.isPreInstalled;
    if (isDefined(update.isVetted)) updateData.isVetted = update.isVetted;

    const isUpdatingBillingExemption =
      allowBillingExemption && isDefined(update.hasFreeLogicFunctionExecutions);

    if (isUpdatingBillingExemption)
      updateData.hasFreeLogicFunctionExecutions =
        update.hasFreeLogicFunctionExecutions;

    if (Object.keys(updateData).length > 0) {
      await this.applicationRegistrationRepository.update(id, updateData);
      await this.invalidateMarketplaceAppsCache();
    }

    if (isUpdatingBillingExemption) {
      await this.coreEntityCacheService.invalidate(
        'applicationRegistrationHasFreeLogicFunctionExecutions',
        id,
      );
    }
  }

  async updateFromManifest({
    applicationRegistrationId,
    manifest,
    sourceType,
    latestAvailableVersion,
    preventVersionDowngrade = false,
    additionalFields,
  }: {
    applicationRegistrationId: string;
    manifest: Manifest;
    sourceType?: ApplicationRegistrationSourceType;
    // null clears the stored version; undefined leaves it untouched.
    latestAvailableVersion?: string | null;
    preventVersionDowngrade?: boolean;
    additionalFields?: Partial<
      Pick<
        ApplicationRegistrationEntity,
        | 'name'
        | 'sourcePackage'
        | 'tarballFileId'
        | 'isListed'
        | 'isVetted'
        | 'ownerWorkspaceId'
      >
    >;
  }): Promise<boolean> {
    return this.cacheLockService.withLock(
      async () => {
        const existing =
          await this.applicationRegistrationRepository.findOneOrFail({
            where: { id: applicationRegistrationId },
          });

        if (
          preventVersionDowngrade &&
          isDefined(latestAvailableVersion) &&
          !shouldRefreshApplicationRegistrationOnInstall({
            installedVersion: latestAvailableVersion,
            latestAvailableVersion: existing.latestAvailableVersion,
          })
        ) {
          this.logger.log(
            `Skipping registration update for ${existing.universalIdentifier}: version ${latestAvailableVersion} is older than latest available version ${existing.latestAvailableVersion}`,
          );

          return false;
        }

        const manifestUpdateFields = buildRegistrationManifestUpdateFields({
          manifestApplication: manifest.application,
          existingGalleryImages: existing.galleryImages,
        });

        // The stored logo file belongs to the previous logo path.
        const hasLogoPathChanged =
          (manifestUpdateFields.logo ?? null) !== (existing.logo ?? null);

        // Partial update in one transaction: the row and its variable schemas
        // stay on the same manifest without clobbering columns written by
        // flows outside this lock.
        await this.applicationRegistrationRepository.manager.transaction(
          async (entityManager) => {
            await entityManager
              .getRepository(ApplicationRegistrationEntity)
              .update(applicationRegistrationId, {
                name: manifest.application?.displayName ?? existing.name,
                manifest,
                ...manifestUpdateFields,
                ...(hasLogoPathChanged && { logoFileId: null }),
                ...(sourceType !== undefined && { sourceType }),
                ...(latestAvailableVersion !== undefined && {
                  latestAvailableVersion,
                }),
                ...additionalFields,
              } as QueryDeepPartialEntity<ApplicationRegistrationEntity>);

            if (isDefined(manifest.application?.serverVariables)) {
              await this.applicationRegistrationVariableService.syncVariableSchemas(
                applicationRegistrationId,
                manifest.application.serverVariables,
                entityManager,
              );
            }
          },
        );

        await this.invalidateMarketplaceAppsCache();

        return true;
      },
      `application-registration-update:${applicationRegistrationId}`,
      APPLICATION_REGISTRATION_UPDATE_LOCK_OPTIONS,
    );
  }

  async delete(id: string, ownerWorkspaceId: string): Promise<boolean> {
    await this.findOneById(id, ownerWorkspaceId);

    // Stored assets (logo, gallery images) go with the registration; deleting
    // them first also removes the bytes, which the row FK cascade cannot do.
    try {
      await this.serverFileStorageService.deleteByApplicationRegistrationId(id);
    } catch (error) {
      this.logger.error(
        `Failed to delete server files for registration ${id}`,
        error,
      );
    }

    await this.applicationRegistrationRepository.delete(id);

    await this.invalidateMarketplaceAppsCache();

    return true;
  }

  async rotateClientSecret(
    id: string,
    ownerWorkspaceId: string,
  ): Promise<string> {
    await this.findOneById(id, ownerWorkspaceId);

    const { clientSecret, clientSecretHash } =
      await this.generateClientSecret();

    await this.applicationRegistrationRepository.update(id, {
      oAuthClientSecretHash: clientSecretHash,
    });

    await this.invalidateMarketplaceAppsCache();

    return clientSecret;
  }

  async verifyClientSecret(
    registration: ApplicationRegistrationEntity,
    clientSecret: string,
  ): Promise<boolean> {
    if (!registration.oAuthClientSecretHash) {
      return false;
    }

    return bcrypt.compare(clientSecret, registration.oAuthClientSecretHash);
  }

  async upsertFromCatalog(
    params: Pick<
      ApplicationRegistrationEntity,
      | 'universalIdentifier'
      | 'name'
      | 'sourceType'
      | 'sourcePackage'
      | 'latestAvailableVersion'
      | 'manifest'
    >,
  ): Promise<void> {
    const existing = await this.findOneByUniversalIdentifier(
      params.universalIdentifier,
    );

    const vettedIdentifiers = new Set(
      MARKETPLACE_VETTED_APPLICATIONS.map((entry) => entry.universalIdentifier),
    );

    const isVetted = vettedIdentifiers.has(params.universalIdentifier);

    const hasFreeLogicFunctionExecutions =
      MARKETPLACE_BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS.includes(
        params.universalIdentifier,
      );

    if (isDefined(existing) && isDefined(params.manifest)) {
      const isNewVersion = await this.setLatestAvailableVersionIfChanged(
        existing.id,
        params.latestAvailableVersion ?? null,
      );

      await this.updateFromManifest({
        applicationRegistrationId: existing.id,
        manifest: params.manifest,
        sourceType: params.sourceType,
        latestAvailableVersion: params.latestAvailableVersion,
        additionalFields: {
          name: params.name,
          sourcePackage: params.sourcePackage,
          isVetted,
        },
      });

      if (isNewVersion) {
        this.emitRegistrationPublishMetric({
          isNewRegistration: false,
          universalIdentifier: params.universalIdentifier,
          name: params.name,
          sourceType: params.sourceType,
          version: params.latestAvailableVersion,
        });

        await this.enqueueAutoUpgradeApplications(existing.id);
      }

      return;
    }

    if (isDefined(existing)) {
      const isNewVersion = await this.setLatestAvailableVersionIfChanged(
        existing.id,
        params.latestAvailableVersion ?? null,
      );

      // A registration first created by a local install (CLI dev / tarball
      // upload) starts unlisted on purpose. Once the catalog source serves the
      // same universalIdentifier, surface it in the marketplace — while
      // preserving an operator's decision to delist a registry-sourced app.
      const isRelistedFromLocalSource =
        existing.sourceType === ApplicationRegistrationSourceType.TARBALL ||
        existing.sourceType === ApplicationRegistrationSourceType.LOCAL;

      await this.applicationRegistrationRepository.save({
        ...existing,
        name: params.name,
        sourceType: params.sourceType,
        sourcePackage: params.sourcePackage,
        latestAvailableVersion: params.latestAvailableVersion,
        isListed: existing.isListed || isRelistedFromLocalSource,
        isVetted,
        manifest: params.manifest,
        ...fromManifestApplicationToDisplayFields(params.manifest?.application),
      });

      await this.invalidateMarketplaceAppsCache();

      if (isNewVersion) {
        this.emitRegistrationPublishMetric({
          isNewRegistration: false,
          universalIdentifier: params.universalIdentifier,
          name: params.name,
          sourceType: params.sourceType,
          version: params.latestAvailableVersion,
        });

        await this.enqueueAutoUpgradeApplications(existing.id);
      }

      return;
    }

    const registration = this.applicationRegistrationRepository.create({
      universalIdentifier: params.universalIdentifier,
      name: params.name,
      sourceType: params.sourceType,
      sourcePackage: params.sourcePackage,
      latestAvailableVersion: params.latestAvailableVersion,
      isListed: true,
      isVetted,
      hasFreeLogicFunctionExecutions,
      manifest: params.manifest,
      ...fromManifestApplicationToDisplayFields(params.manifest?.application),
      oAuthClientId: v4(),
      oAuthRedirectUris: [],
      oAuthScopes: [],
      ownerWorkspaceId: null,
    });

    await this.applicationRegistrationRepository.save(registration);

    this.emitRegistrationPublishMetric({
      isNewRegistration: true,
      universalIdentifier: params.universalIdentifier,
      name: params.name,
      sourceType: params.sourceType,
      version: params.latestAvailableVersion,
    });

    await this.invalidateMarketplaceAppsCache();

    if (!isDefined(params.manifest?.application?.serverVariables)) {
      return;
    }

    await this.applicationRegistrationVariableService.syncVariableSchemas(
      registration.id,
      params.manifest.application.serverVariables,
    );
  }

  async createCliRegistrationIfNotExists(): Promise<ApplicationRegistrationEntity | null> {
    const existing = await this.findOneByUniversalIdentifier(
      TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
    );

    if (isDefined(existing)) {
      return null;
    }

    const registration = this.applicationRegistrationRepository.create({
      universalIdentifier:
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      name: TWENTY_CLI_APPLICATION_REGISTRATION.name,
      oAuthClientId: v4(),
      oAuthClientSecretHash: null,
      oAuthRedirectUris: [],
      oAuthScopes: TWENTY_CLI_APPLICATION_REGISTRATION.oAuthScopes,
      ownerWorkspaceId: null,
      sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      createdByUserId: null,
    });

    const saved =
      await this.applicationRegistrationRepository.save(registration);

    await this.invalidateMarketplaceAppsCache();

    return saved;
  }

  async findManyListedCatalogCards(): Promise<
    ApplicationRegistrationCatalogCard[]
  > {
    const registrations = await this.applicationRegistrationRepository.find({
      select: [
        'id',
        'universalIdentifier',
        'name',
        'sourceType',
        'sourcePackage',
        'latestAvailableVersion',
        'isVetted',
        'logo',
        'logoFileId',
        'description',
        'author',
        'category',
      ],
      where: {
        isListed: true,
        sourceType: ApplicationRegistrationSourceType.NPM,
      },
    });

    return registrations.map((registration) => ({
      id: registration.id,
      universalIdentifier: registration.universalIdentifier,
      name: registration.name,
      sourcePackage: registration.sourcePackage,
      isVetted: registration.isVetted,
      description: registration.description,
      author: registration.author,
      category: registration.category,
      logoUrl:
        this.applicationRegistrationAssetUrlService.buildLogoUrl(registration),
    }));
  }

  async getStats(
    applicationRegistrationId: string,
    ownerWorkspaceId: string,
  ): Promise<ApplicationRegistrationStatsDTO> {
    await this.findOneById(applicationRegistrationId, ownerWorkspaceId);

    return this.computeStats(applicationRegistrationId);
  }

  // Admin panel views apps across all workspaces, so ownership is not enforced.
  async getStatsGlobal(
    applicationRegistrationId: string,
  ): Promise<ApplicationRegistrationStatsDTO> {
    await this.findOneByIdGlobal(applicationRegistrationId);

    return this.computeStats(applicationRegistrationId);
  }

  private async computeStats(
    applicationRegistrationId: string,
  ): Promise<ApplicationRegistrationStatsDTO> {
    const versionDistribution: { version: string; count: number }[] =
      await this.applicationRepository
        .createQueryBuilder('application')
        .select("COALESCE(application.version, 'unknown')", 'version')
        .addSelect('COUNT(*)::int', 'count')
        .where(
          'application."applicationRegistrationId" = :applicationRegistrationId',
          { applicationRegistrationId },
        )
        .andWhere('application."deletedAt" IS NULL')
        .groupBy('version')
        .orderBy('count', 'DESC')
        .getRawMany();

    const activeInstalls = versionDistribution.reduce(
      (sum, entry) => sum + entry.count,
      0,
    );

    const mostInstalledVersion = versionDistribution[0]?.version ?? null;

    return {
      activeInstalls,
      mostInstalledVersion,
      versionDistribution,
    };
  }

  // Installed workspaces are only exposed in the admin panel, which views apps
  // across all workspaces, so ownership is not enforced.
  async getInstalledWorkspacesGlobal(
    applicationRegistrationId: string,
    limit: number,
    offset: number,
    searchTerm?: string,
  ): Promise<ApplicationRegistrationInstalledWorkspacesDTO> {
    await this.findOneByIdGlobal(applicationRegistrationId);

    return this.computeInstalledWorkspaces(
      applicationRegistrationId,
      limit,
      offset,
      searchTerm,
    );
  }

  private async computeInstalledWorkspaces(
    applicationRegistrationId: string,
    limit: number,
    offset: number,
    searchTerm?: string,
  ): Promise<ApplicationRegistrationInstalledWorkspacesDTO> {
    const trimmedSearch = searchTerm?.trim();

    const where: FindOptionsWhere<ApplicationEntity> = {
      applicationRegistrationId,
    };

    const whereClauses: FindOptionsWhere<ApplicationEntity>[] =
      isDefined(trimmedSearch) && trimmedSearch.length > 0
        ? [
            {
              ...where,
              workspace: { displayName: ILike(`%${trimmedSearch}%`) },
            },
            { ...where, version: ILike(`%${trimmedSearch}%`) },
          ]
        : [where];

    const [applications, totalCount] =
      await this.applicationRepository.findAndCount({
        where: whereClauses,
        relations: { workspace: true },
        order: { workspace: { displayName: 'ASC' }, id: 'ASC' },
        skip: offset,
        take: limit,
      });

    const workspaces = applications.map((application) => ({
      id: application.workspace.id,
      displayName: application.workspace.displayName ?? null,
      logo: application.workspace.logo ?? null,
      version: application.version ?? null,
    }));

    return {
      workspaces,
      totalCount,
      hasMore: offset + workspaces.length < totalCount,
    };
  }

  async findClaimable(params: {
    sourcePackage?: string;
    universalIdentifier?: string;
  }): Promise<ClaimableApplicationRegistrationDTO | null> {
    const hasPackage = isNonEmptyString(params.sourcePackage);
    const hasUniversalIdentifier = isNonEmptyString(params.universalIdentifier);

    if (hasPackage === hasUniversalIdentifier) {
      throw new ApplicationRegistrationException(
        'Provide exactly one of sourcePackage or universalIdentifier',
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const where: FindOptionsWhere<ApplicationRegistrationEntity> = {
      sourceType: ApplicationRegistrationSourceType.NPM,
      ...(hasPackage
        ? { sourcePackage: params.sourcePackage }
        : { universalIdentifier: params.universalIdentifier }),
    };

    const registration = await this.applicationRegistrationRepository.findOne({
      select: APPLICATION_REGISTRATION_WITHOUT_MANIFEST_SELECT,
      where,
    });

    if (!isDefined(registration)) {
      return null;
    }

    return {
      id: registration.id,
      universalIdentifier: registration.universalIdentifier,
      name: registration.name,
      sourcePackage: registration.sourcePackage,
      logoUrl:
        this.applicationRegistrationAssetUrlService.buildLogoUrl(registration),
      description: registration.description,
      author: registration.author,
      isOwned: isDefined(registration.ownerWorkspaceId),
    };
  }

  async claimOwnership(params: {
    applicationRegistrationId: string;
    claimingWorkspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const registration = await this.findOneByIdGlobal(
      params.applicationRegistrationId,
    );

    // Only unclaimed registrations (no owner workspace) can be claimed.
    if (isDefined(registration.ownerWorkspaceId)) {
      throw new ApplicationRegistrationException(
        'Application registration is already owned by a workspace',
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED,
      );
    }

    // Claim atomically: only update while still unowned so concurrent
    // claimers can't overwrite each other (first-claimant-wins).
    const updateResult = await this.applicationRegistrationRepository.update(
      { id: registration.id, ownerWorkspaceId: IsNull() },
      { ownerWorkspaceId: params.claimingWorkspaceId },
    );

    if (updateResult.affected === 0) {
      throw new ApplicationRegistrationException(
        'Application registration is already owned by a workspace',
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED,
      );
    }

    await this.invalidateMarketplaceAppsCache();

    return this.applicationRegistrationRepository.findOneOrFail({
      where: { id: registration.id },
    });
  }

  async transferOwnership(params: {
    applicationRegistrationId: string;
    targetWorkspaceSubdomain: string;
    currentOwnerWorkspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const registration = await this.findOneById(
      params.applicationRegistrationId,
      params.currentOwnerWorkspaceId,
    );

    const targetWorkspace = await this.workspaceRepository.findOne({
      where: { subdomain: params.targetWorkspaceSubdomain },
    });

    if (!isDefined(targetWorkspace)) {
      throw new ApplicationRegistrationException(
        `No workspace found with subdomain "${params.targetWorkspaceSubdomain}"`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    if (targetWorkspace.id === params.currentOwnerWorkspaceId) {
      throw new ApplicationRegistrationException(
        'Cannot transfer ownership to the same workspace',
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    await this.applicationRegistrationRepository.update(registration.id, {
      ownerWorkspaceId: targetWorkspace.id,
    });

    await this.invalidateMarketplaceAppsCache();

    return this.applicationRegistrationRepository.findOneOrFail({
      where: { id: registration.id },
    });
  }

  private async generateClientSecret(): Promise<{
    clientSecret: string;
    clientSecretHash: string;
  }> {
    const clientSecret = crypto.randomBytes(32).toString('hex');
    const clientSecretHash = await bcrypt.hash(
      clientSecret,
      BCRYPT_SALT_ROUNDS,
    );

    return { clientSecret, clientSecretHash };
  }

  private validateRedirectUris(uris: string[]): void {
    for (const uri of uris) {
      const result = validateRedirectUri(uri);

      if (!result.valid) {
        throw new ApplicationRegistrationException(
          result.reason,
          ApplicationRegistrationExceptionCode.INVALID_REDIRECT_URI,
        );
      }
    }
  }

  private validateScopes(scopes: string[]): void {
    const validScopes: readonly string[] = ALL_OAUTH_SCOPES;
    const invalidScopes = scopes.filter(
      (scope) => !validScopes.includes(scope),
    );

    if (invalidScopes.length > 0) {
      throw new ApplicationRegistrationException(
        `Invalid scopes: ${invalidScopes.join(', ')}`,
        ApplicationRegistrationExceptionCode.INVALID_SCOPE,
      );
    }
  }
}
