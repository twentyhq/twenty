import { Injectable } from '@nestjs/common';

import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';

// Shared second half of every application delivery flow: marketplace/tarball
// installs and CLI dev sync all apply a manifest to a workspace and refresh
// the shared registration through the same steps, so every source produces
// the same state with the same guards.
@Injectable()
export class ApplicationManifestApplyService {
  constructor(
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
  ) {}

  async applyManifestToWorkspace({
    workspaceId,
    manifest,
    applicationRegistrationId,
    application,
  }: {
    workspaceId: string;
    manifest: Manifest;
    applicationRegistrationId?: string;
    application: ApplicationEntity;
  }): Promise<{
    workspaceMigration: WorkspaceMigration;
    hasSchemaMetadataChanged: boolean;
  }> {
    // The application version is only persisted by a successful sync, so a
    // missing version means no sync ever completed for this application and
    // the SDK client must be generated regardless of schema changes.
    const isFirstApply = !isDefined(application.version);

    const { workspaceMigration, hasSchemaMetadataChanged } =
      await this.applicationSyncService.synchronizeFromManifest({
        workspaceId,
        manifest,
        applicationRegistrationId,
      });

    if (isFirstApply || hasSchemaMetadataChanged) {
      await this.sdkClientGenerationService.generateSdkClientForApplication({
        workspaceId,
        applicationId: application.id,
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }

    return { workspaceMigration, hasSchemaMetadataChanged };
  }

  // Refreshes the shared registration row from a manifest and keeps its
  // variable schemas in sync with it. Returns false when nothing was written:
  // either the caller is not allowed to write this registration, or the
  // manifest belongs to a version older than the latest available one.
  async refreshRegistrationFromManifest({
    applicationRegistrationId,
    manifest,
    sourceType,
    latestAvailableVersion,
    preventVersionDowngrade,
    onlyIfOwnedByWorkspaceId,
  }: {
    applicationRegistrationId: string;
    manifest: Manifest;
    sourceType?: ApplicationRegistrationSourceType;
    latestAvailableVersion?: string;
    preventVersionDowngrade?: boolean;
    // The registration is instance-global: for catalog-synced (npm) apps it
    // is the marketplace entry and OAuth identity shared by every workspace.
    // Callers acting on behalf of a workspace (dev sync) pass their
    // workspaceId so only registrations owned by that workspace (and not
    // npm-sourced) are written.
    onlyIfOwnedByWorkspaceId?: string;
  }): Promise<boolean> {
    if (isDefined(onlyIfOwnedByWorkspaceId)) {
      const registration =
        await this.applicationRegistrationService.findOneByIdGlobal(
          applicationRegistrationId,
        );

      if (
        registration.sourceType === ApplicationRegistrationSourceType.NPM ||
        registration.ownerWorkspaceId !== onlyIfOwnedByWorkspaceId
      ) {
        return false;
      }
    }

    const hasUpdatedRegistration =
      await this.applicationRegistrationService.updateFromManifest({
        applicationRegistrationId,
        manifest,
        sourceType,
        latestAvailableVersion,
        preventVersionDowngrade,
      });

    if (!hasUpdatedRegistration) {
      return false;
    }

    if (isDefined(manifest.application.serverVariables)) {
      await this.applicationRegistrationVariableService.syncVariableSchemas(
        applicationRegistrationId,
        manifest.application.serverVariables,
      );
    }

    return true;
  }
}
