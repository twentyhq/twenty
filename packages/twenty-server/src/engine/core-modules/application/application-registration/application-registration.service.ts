import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import * as bcrypt from 'bcrypt';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { type ApplicationRegistrationStatsDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-stats.dto';
import { type CreateApplicationRegistrationInput } from 'src/engine/core-modules/application/application-registration/dtos/create-application-registration.input';
import { type PublicApplicationRegistrationDTO } from 'src/engine/core-modules/application/application-registration/dtos/public-application-registration.dto';
import { type UpdateApplicationRegistrationInput } from 'src/engine/core-modules/application/application-registration/dtos/update-application-registration.input';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { validateRedirectUri } from 'src/engine/core-modules/auth/utils/validate-redirect-uri.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { MARKETPLACE_CURATED_APPLICATIONS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-curated-applications.constant';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class ApplicationRegistrationService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
  ) {}

  async findMany(
    ownerWorkspaceId: string,
  ): Promise<ApplicationRegistrationEntity[]> {
    return this.applicationRegistrationRepository.find({
      where: { ownerWorkspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<ApplicationRegistrationEntity[]> {
    return this.applicationRegistrationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(
    id: string,
    ownerWorkspaceId: string,
  ): Promise<ApplicationRegistrationEntity> {
    const registration = await this.applicationRegistrationRepository.findOne({
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
      select: ['id', 'name', 'manifest', 'oAuthScopes'],
    });

    if (!registration) {
      return null;
    }

    return {
      id: registration.id,
      name: registration.name,
      logoUrl: registration.manifest?.application?.logoUrl ?? null,
      websiteUrl: registration.manifest?.application?.websiteUrl ?? null,
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

    return { applicationRegistration: saved, clientSecret };
  }

  async update(
    input: UpdateApplicationRegistrationInput,
    ownerWorkspaceId: string,
  ): Promise<ApplicationRegistrationEntity> {
    const { id, update } = input;

    await this.findOneById(id, ownerWorkspaceId);

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

    if (Object.keys(updateData).length > 0) {
      await this.applicationRegistrationRepository.update(id, updateData);
    }

    return this.findOneById(id, ownerWorkspaceId);
  }

  async updateFromManifest(
    applicationRegistrationId: string,
    manifest: Manifest,
  ): Promise<void> {
    const existing = await this.applicationRegistrationRepository.findOneOrFail(
      { where: { id: applicationRegistrationId } },
    );

    await this.applicationRegistrationRepository.save({
      ...existing,
      name: manifest.application.displayName,
      manifest,
    });
  }

  async delete(id: string, ownerWorkspaceId: string): Promise<boolean> {
    await this.findOneById(id, ownerWorkspaceId);
    await this.applicationRegistrationRepository.softDelete(id);

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

    const curatedIdentifiers = new Set(
      MARKETPLACE_CURATED_APPLICATIONS.map(
        (entry) => entry.universalIdentifier,
      ),
    );

    const isFeatured = curatedIdentifiers.has(params.universalIdentifier);

    if (isDefined(existing)) {
      await this.applicationRegistrationRepository.save({
        ...existing,
        name: params.name,
        sourceType: params.sourceType,
        sourcePackage: params.sourcePackage,
        latestAvailableVersion: params.latestAvailableVersion,
        manifest: params.manifest,
        isFeatured,
      });
    } else {
      const registration = this.applicationRegistrationRepository.create({
        universalIdentifier: params.universalIdentifier,
        name: params.name,
        sourceType: params.sourceType,
        sourcePackage: params.sourcePackage,
        latestAvailableVersion: params.latestAvailableVersion,
        isListed: true,
        isFeatured,
        manifest: params.manifest,
        oAuthClientId: v4(),
        oAuthRedirectUris: [],
        oAuthScopes: [],
        ownerWorkspaceId: null,
      });

      await this.applicationRegistrationRepository.save(registration);
    }

    if (!isDefined(params.manifest?.application?.serverVariables)) {
      return;
    }

    const registration = await this.findOneByUniversalIdentifier(
      params.universalIdentifier,
    );

    if (!isDefined(registration)) {
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

    return this.applicationRegistrationRepository.save(registration);
  }

  async findManyListed(): Promise<ApplicationRegistrationEntity[]> {
    return this.applicationRegistrationRepository.find({
      where: {
        isListed: true,
        sourceType: ApplicationRegistrationSourceType.NPM,
      },
    });
  }

  async getStats(
    applicationRegistrationId: string,
    ownerWorkspaceId: string,
  ): Promise<ApplicationRegistrationStatsDTO> {
    await this.findOneById(applicationRegistrationId, ownerWorkspaceId);

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
