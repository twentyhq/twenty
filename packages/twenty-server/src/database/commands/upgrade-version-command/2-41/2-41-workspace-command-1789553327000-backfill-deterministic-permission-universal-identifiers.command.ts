import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import {
  getFieldPermissionUniversalIdentifier,
  getObjectPermissionUniversalIdentifier,
  getRolePermissionFlagUniversalIdentifier,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { withDerivedFieldMetadataMaps } from 'src/engine/metadata-modules/flat-entity/utils/with-derived-field-metadata-maps.util';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type UniversalIdentifierUpdate = {
  id: string;
  universalIdentifier: string;
};

const computeUniversalIdentifierUpdates = <
  TFlatEntity extends SyncableFlatEntity,
>({
  flatEntities,
  getUniversalIdentifier,
}: {
  flatEntities: TFlatEntity[];
  getUniversalIdentifier: (flatEntity: TFlatEntity) => string;
}): UniversalIdentifierUpdate[] =>
  flatEntities
    .map((flatEntity) => ({
      flatEntity,
      universalIdentifier: getUniversalIdentifier(flatEntity),
    }))
    .filter(
      ({ flatEntity, universalIdentifier }) =>
        flatEntity.universalIdentifier !== universalIdentifier,
    )
    .map(({ flatEntity, universalIdentifier }) => ({
      id: flatEntity.id,
      universalIdentifier,
    }));

@RegisteredWorkspaceCommand('2.41.0', 1789553327000)
@Command({
  name: 'upgrade:2-41:backfill-deterministic-permission-universal-identifiers',
  description:
    'Recompute the universal identifier of every role permission flag, and of object and field permissions owned by the workspace custom application, from their application, role and target.',
})
export class BackfillDeterministicPermissionUniversalIdentifiersCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatObjectPermissionMaps,
      flatFieldPermissionMaps,
      flatRolePermissionFlagMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectPermissionMaps',
      'flatFieldPermissionMaps',
      'flatRolePermissionFlagMaps',
    ]);

    const isOwnedByWorkspaceCustomApplication = (
      flatEntity: SyncableFlatEntity,
    ) => flatEntity.applicationId === workspaceCustomFlatApplication.id;

    const objectPermissionUpdates = computeUniversalIdentifierUpdates({
      flatEntities: Object.values(flatObjectPermissionMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(isOwnedByWorkspaceCustomApplication),
      getUniversalIdentifier: (flatObjectPermission) =>
        getObjectPermissionUniversalIdentifier({
          applicationUniversalIdentifier:
            flatObjectPermission.applicationUniversalIdentifier,
          roleUniversalIdentifier: flatObjectPermission.roleUniversalIdentifier,
          objectUniversalIdentifier:
            flatObjectPermission.objectMetadataUniversalIdentifier,
        }),
    });

    const fieldPermissionUpdates = computeUniversalIdentifierUpdates({
      flatEntities: Object.values(flatFieldPermissionMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(isOwnedByWorkspaceCustomApplication),
      getUniversalIdentifier: (flatFieldPermission) =>
        getFieldPermissionUniversalIdentifier({
          applicationUniversalIdentifier:
            flatFieldPermission.applicationUniversalIdentifier,
          roleUniversalIdentifier: flatFieldPermission.roleUniversalIdentifier,
          fieldUniversalIdentifier:
            flatFieldPermission.fieldMetadataUniversalIdentifier,
        }),
    });

    const rolePermissionFlagUpdates = computeUniversalIdentifierUpdates({
      flatEntities: Object.values(
        flatRolePermissionFlagMaps.byUniversalIdentifier,
      ).filter(isDefined),
      getUniversalIdentifier: (flatRolePermissionFlag) =>
        getRolePermissionFlagUniversalIdentifier({
          applicationUniversalIdentifier:
            flatRolePermissionFlag.applicationUniversalIdentifier,
          roleUniversalIdentifier: flatRolePermissionFlag.roleUniversalIdentifier,
          permissionFlagUniversalIdentifier:
            flatRolePermissionFlag.permissionFlagUniversalIdentifier,
        }),
    });

    const updateCount =
      objectPermissionUpdates.length +
      fieldPermissionUpdates.length +
      rolePermissionFlagUpdates.length;

    if (updateCount === 0) {
      this.logger.log(
        `No permission universal identifiers to backfill for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling ${objectPermissionUpdates.length} object permission, ${fieldPermissionUpdates.length} field permission and ${rolePermissionFlagUpdates.length} role permission flag universal identifier(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.coreDataSource.transaction(async (entityManager) => {
      for (const { id, universalIdentifier } of objectPermissionUpdates) {
        await entityManager.update(
          ObjectPermissionEntity,
          { id, workspaceId },
          { universalIdentifier },
        );
      }

      for (const { id, universalIdentifier } of fieldPermissionUpdates) {
        await entityManager.update(
          FieldPermissionEntity,
          { id, workspaceId },
          { universalIdentifier },
        );
      }

      for (const { id, universalIdentifier } of rolePermissionFlagUpdates) {
        await entityManager.update(
          RolePermissionFlagEntity,
          { id, workspaceId },
          { universalIdentifier },
        );
      }
    });

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      withDerivedFieldMetadataMaps([
        'flatObjectPermissionMaps',
        'flatFieldPermissionMaps',
        'flatRolePermissionFlagMaps',
        'flatRoleMaps',
        'flatPermissionFlagMaps',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]),
    );

    this.logger.log(
      `Backfilled ${updateCount} permission universal identifier(s) for workspace ${workspaceId}`,
    );
  }
}
