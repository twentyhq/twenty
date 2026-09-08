import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeUnrestrictableFieldPermissionChanges } from 'src/database/commands/upgrade-version-command/2-40/utils/compute-unrestrictable-field-permission-changes.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.40.0', 1788871569052)
@Command({
  name: 'upgrade:2-40:clear-unrestrictable-field-permissions',
  description:
    'Clear field permissions the roles UI cannot represent: restrictions on the non-editable createdAt/updatedAt/deletedAt/createdBy fields, and read restrictions on label identifiers. Idempotent.',
})
export class ClearUnrestrictableFieldPermissionsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(FieldPermissionEntity)
    private readonly fieldPermissionRepository: Repository<FieldPermissionEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatFieldPermissionMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldPermissionMaps',
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
    ]);

    const { fieldPermissionIdsToDelete, fieldPermissionIdsToClearReadOn } =
      computeUnrestrictableFieldPermissionChanges({
        applicationId: workspaceCustomFlatApplication.id,
        flatFieldPermissionMaps,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      });

    if (
      fieldPermissionIdsToDelete.length === 0 &&
      fieldPermissionIdsToClearReadOn.length === 0
    ) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Deleting ${fieldPermissionIdsToDelete.length} field permission(s) on non-editable system fields and clearing read on ${fieldPermissionIdsToClearReadOn.length} label identifier(s) for workspace ${workspaceId}`,
    );

    if (options.dryRun) {
      return;
    }

    await this.fieldPermissionRepository.manager.transaction(
      async (entityManager) => {
        if (fieldPermissionIdsToDelete.length > 0) {
          await entityManager.delete(
            FieldPermissionEntity,
            fieldPermissionIdsToDelete,
          );
        }

        if (fieldPermissionIdsToClearReadOn.length > 0) {
          await entityManager.update(
            FieldPermissionEntity,
            fieldPermissionIdsToClearReadOn,
            { canReadFieldValue: null },
          );
        }
      },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFieldPermissionMaps',
      'rolesPermissions',
    ]);
  }
}
