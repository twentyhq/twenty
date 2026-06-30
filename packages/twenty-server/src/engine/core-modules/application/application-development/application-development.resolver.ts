import {
  Logger,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import {
  ApplicationDeployPlanService,
  renderDeploySerial,
} from 'src/engine/core-modules/application/application-deploy/application-deploy-plan.service';
import { ApplicationDeployPlanStoreService } from 'src/engine/core-modules/application/application-deploy/application-deploy-plan-store.service';
import { ApplicationInput } from 'src/engine/core-modules/application/application-development/dtos/application.input';
import { ApplicationSyncPlanDTO } from 'src/engine/core-modules/application/application-development/dtos/application-sync-plan.dto';
import { CreateDevelopmentApplicationInput } from 'src/engine/core-modules/application/application-development/dtos/create-development-application.input';
import { DevelopmentApplicationDTO } from 'src/engine/core-modules/application/application-development/dtos/development-application.dto';
import { GenerateApplicationTokenInput } from 'src/engine/core-modules/application/application-development/dtos/generate-application-token.input';
import { UploadApplicationFileInput } from 'src/engine/core-modules/application/application-development/dtos/upload-application-file.input';
import { WorkspaceMigrationDTO } from 'src/engine/core-modules/application/application-development/dtos/workspace-migration.dto';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { resolveManifestAssetUrls } from 'src/engine/core-modules/application/application-marketplace/utils/resolve-manifest-asset-urls.util';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const APP_DEV_RATE_LIMIT_MAX = 30;
const APP_DEV_RATE_LIMIT_WINDOW_MS = 30_000;

const APP_SYNC_LOCK_OPTIONS = { ttl: 60_000, ms: 500, maxRetries: 120 };

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseFilters(ApplicationExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
export class ApplicationDevelopmentResolver {
  private readonly logger = new Logger(ApplicationDevelopmentResolver.name);

  constructor(
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly applicationService: ApplicationService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    private readonly fileStorageService: FileStorageService,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly throttlerService: ThrottlerService,
    private readonly cacheLockService: CacheLockService,
    private readonly applicationDeployPlanService: ApplicationDeployPlanService,
    private readonly applicationDeployPlanStoreService: ApplicationDeployPlanStoreService,
  ) {}

  @Mutation(() => DevelopmentApplicationDTO)
  async createDevelopmentApplication(
    @Args() { universalIdentifier, name }: CreateDevelopmentApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<DevelopmentApplicationDTO> {
    await this.throttlePerApplication(universalIdentifier, workspaceId);

    const applicationRegistrationId =
      await this.findApplicationRegistrationId(universalIdentifier);

    const existing = await this.applicationService.findByUniversalIdentifier({
      universalIdentifier,
      workspaceId,
    });

    if (existing) {
      return {
        id: existing.id,
        universalIdentifier: existing.universalIdentifier,
      };
    }

    const application = await this.applicationService.create({
      universalIdentifier,
      name,
      sourcePath: universalIdentifier,
      sourceType: ApplicationRegistrationSourceType.LOCAL,
      applicationRegistrationId,
      workspaceId,
    });

    return {
      id: application.id,
      universalIdentifier: application.universalIdentifier,
    };
  }

  @Mutation(() => ApplicationTokenPairDTO)
  async generateApplicationToken(
    @Args() { applicationId }: GenerateApplicationTokenInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser({ allowUndefined: true }) user?: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true }) userWorkspaceId?: string,
  ): Promise<ApplicationTokenPairDTO> {
    await this.throttlePerApplication(applicationId, workspaceId);

    return this.applicationTokenService.generateApplicationTokenPair({
      workspaceId,
      applicationId,
      userId: user?.id,
      userWorkspaceId,
    });
  }

  @Mutation(() => ApplicationSyncPlanDTO)
  async planApplicationSync(
    @Args() { manifest }: ApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationSyncPlanDTO> {
    await this.throttlePerApplication(
      manifest.application.universalIdentifier,
      workspaceId,
    );

    const plan = await this.applicationDeployPlanService.computePlan({
      workspaceId,
      manifest,
    });

    const planId = await this.applicationDeployPlanStoreService.store({
      workspaceId,
      plan: {
        applicationUniversalIdentifier:
          manifest.application.universalIdentifier,
        manifest,
        planDigest: plan.planDigest,
      },
    });

    return { ...plan, planId };
  }

  @Mutation(() => WorkspaceMigrationDTO)
  async syncApplication(
    @Args()
    { manifest, dryRun, allowDestructive, applyPlanId }: ApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true }) userWorkspaceId?: string,
  ): Promise<WorkspaceMigrationDTO> {
    await this.throttlePerApplication(
      manifest.application.universalIdentifier,
      workspaceId,
    );

    if (dryRun === true) {
      const { workspaceMigration } =
        await this.applicationSyncService.synchronizeFromManifest({
          workspaceId,
          manifest,
          dryRun: true,
        });

      return {
        applicationUniversalIdentifier:
          workspaceMigration.applicationUniversalIdentifier,
        actions: workspaceMigration.actions,
      };
    }

    return this.cacheLockService.withLock(
      () =>
        this.applyManifestSync({
          manifest,
          workspaceId,
          allowDestructive: allowDestructive === true,
          actorUserWorkspaceId: userWorkspaceId,
          applyPlanId,
        }),
      `app-sync:${workspaceId}`,
      APP_SYNC_LOCK_OPTIONS,
    );
  }

  private async applyManifestSync({
    manifest,
    workspaceId,
    allowDestructive,
    actorUserWorkspaceId,
    applyPlanId,
  }: {
    manifest: ApplicationInput['manifest'];
    workspaceId: string;
    allowDestructive: boolean;
    actorUserWorkspaceId: string | undefined;
    applyPlanId: string | undefined;
  }): Promise<WorkspaceMigrationDTO> {
    const storedPlan = isDefined(applyPlanId)
      ? await this.applicationDeployPlanStoreService.get({
          workspaceId,
          planId: applyPlanId,
        })
      : undefined;

    if (isDefined(applyPlanId) && !isDefined(storedPlan)) {
      throw new ApplicationException(
        'Deploy plan not found or already applied.',
        ApplicationExceptionCode.DEPLOY_PLAN_NOT_FOUND,
      );
    }

    const effectiveManifest = storedPlan?.manifest ?? manifest;

    const applicationRegistrationId = await this.findApplicationRegistrationId(
      effectiveManifest.application.universalIdentifier,
    );

    const application = await this.applicationService.findByUniversalIdentifier(
      {
        universalIdentifier: effectiveManifest.application.universalIdentifier,
        workspaceId,
      },
    );

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application "${effectiveManifest.application.universalIdentifier}" not found in workspace "${workspaceId}". Run createDevelopmentApplication first.`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const plan = await this.applicationDeployPlanService.computePlan({
      workspaceId,
      manifest: effectiveManifest,
    });

    if (isDefined(storedPlan) && plan.planDigest !== storedPlan.planDigest) {
      throw new ApplicationException(
        'The application changed since this plan was reviewed.',
        ApplicationExceptionCode.DEPLOY_PLAN_DRIFTED,
      );
    }

    if (plan.isEmpty) {
      await this.syncRegistrationMetadata(
        applicationRegistrationId,
        effectiveManifest,
        workspaceId,
        application.id,
      );

      await this.consumePlan(workspaceId, applyPlanId);

      return {
        applicationUniversalIdentifier:
          effectiveManifest.application.universalIdentifier,
        actions: [],
      };
    }

    if (plan.hasDestructiveActions && !allowDestructive) {
      throw new ApplicationException(
        this.buildDestructiveChangesMessage(plan),
        ApplicationExceptionCode.DESTRUCTIVE_CHANGES_NOT_APPROVED,
      );
    }

    const isFirstSync = !isDefined(application.version);

    const { workspaceMigration, hasSchemaMetadataChanged } =
      await this.applicationSyncService.synchronizeFromManifest({
        workspaceId,
        manifest: effectiveManifest,
        applicationRegistrationId,
      });

    if (isFirstSync || hasSchemaMetadataChanged) {
      await this.sdkClientGenerationService.generateSdkClientForApplication({
        workspaceId,
        applicationId: application.id,
        applicationUniversalIdentifier:
          effectiveManifest.application.universalIdentifier,
      });
    }

    await this.syncRegistrationMetadata(
      applicationRegistrationId,
      effectiveManifest,
      workspaceId,
      application.id,
    );

    const nextSerial = (application.deploySerial ?? 0) + 1;

    await this.applicationService.update(application.id, {
      workspaceId,
      version: renderDeploySerial(nextSerial),
      deploySerial: nextSerial,
    });

    if (plan.hasDestructiveActions) {
      this.logger.log(
        `Destructive application deploy applied — application=${effectiveManifest.application.universalIdentifier} workspace=${workspaceId} actor=${actorUserWorkspaceId ?? 'unknown'} version=${renderDeploySerial(nextSerial)} destructiveActions=${plan.summary.destructiveCount} affectedRows=${plan.summary.totalAffectedRows}`,
      );
    }

    await this.consumePlan(workspaceId, applyPlanId);

    return {
      applicationUniversalIdentifier:
        workspaceMigration.applicationUniversalIdentifier,
      actions: workspaceMigration.actions,
    };
  }

  private async consumePlan(
    workspaceId: string,
    applyPlanId: string | undefined,
  ): Promise<void> {
    if (isDefined(applyPlanId)) {
      await this.applicationDeployPlanStoreService.consume({
        workspaceId,
        planId: applyPlanId,
      });
    }
  }

  private buildDestructiveChangesMessage(plan: ApplicationSyncPlanDTO): string {
    const destructiveLabels = plan.actions
      .filter((action) => action.severity === 'destructive')
      .map((action) => action.label ?? action.universalIdentifier)
      .join(', ');

    return `This deploy includes ${plan.summary.destructiveCount} destructive change(s) that permanently delete data (${destructiveLabels}). Re-run with allowDestructive set to true to proceed.`;
  }

  @Mutation(() => FileDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  async uploadApplicationFile(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream }: FileUpload,
    @Args()
    {
      applicationUniversalIdentifier,
      fileFolder,
      filePath,
    }: UploadApplicationFileInput,
  ): Promise<FileDTO> {
    await this.throttlePerApplication(
      applicationUniversalIdentifier,
      workspaceId,
    );

    const allowedApplicationFileFolders: FileFolder[] = [
      FileFolder.BuiltLogicFunction,
      FileFolder.BuiltFrontComponent,
      FileFolder.PublicAsset,
      FileFolder.Source,
      FileFolder.Dependencies,
    ];

    if (!allowedApplicationFileFolders.includes(fileFolder)) {
      throw new ApplicationException(
        `Invalid fileFolder for application file upload. Allowed values: ${allowedApplicationFileFolders.join(', ')}`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const pathValidationResult = validateFilePath({
      resourcePath: filePath,
      fileFolder,
    });

    if (!pathValidationResult.isValid) {
      throw new ApplicationException(
        pathValidationResult.error,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const application = await this.applicationService.findByUniversalIdentifier(
      {
        universalIdentifier: applicationUniversalIdentifier,
        workspaceId,
      },
    );

    if (!isDefined(application)) {
      throw new ApplicationException(
        'Application not found in workspace.',
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const buffer = await streamToBuffer(createReadStream());

    return await this.fileStorageService.writeFile({
      sourceFile: buffer,
      fileFolder,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath: filePath,
      settings: { isTemporaryFile: false, toDelete: false },
    });
  }

  private async throttlePerApplication(
    applicationIdentifier: string,
    workspaceId: string,
  ): Promise<void> {
    await this.throttlerService.tokenBucketThrottleOrThrow(
      `app-dev:${workspaceId}:${applicationIdentifier}`,
      1,
      APP_DEV_RATE_LIMIT_MAX,
      APP_DEV_RATE_LIMIT_WINDOW_MS,
    );
  }

  private async findApplicationRegistrationId(
    universalIdentifier: string,
  ): Promise<string> {
    const existingRegistration =
      await this.applicationRegistrationService.findOneByUniversalIdentifier(
        universalIdentifier,
      );

    if (!existingRegistration) {
      throw new ApplicationException(
        `No registration found for "${universalIdentifier}". Create one first with createApplicationRegistration.`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return existingRegistration.id;
  }

  private async syncRegistrationMetadata(
    applicationRegistrationId: string,
    manifest: ApplicationInput['manifest'],
    workspaceId: string,
    applicationId: string,
  ): Promise<void> {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    const manifestWithResolvedUrls = resolveManifestAssetUrls(
      manifest,
      (filePath) =>
        `${serverUrl}/public-assets/${workspaceId}/${applicationId}/${filePath}`,
    );

    await this.applicationRegistrationService.updateFromManifest({
      applicationRegistrationId,
      manifest: manifestWithResolvedUrls,
      sourceType: ApplicationRegistrationSourceType.LOCAL,
    });

    if (manifest.application.serverVariables) {
      await this.applicationRegistrationVariableService.syncVariableSchemas(
        applicationRegistrationId,
        manifest.application.serverVariables,
      );
    }
  }
}
