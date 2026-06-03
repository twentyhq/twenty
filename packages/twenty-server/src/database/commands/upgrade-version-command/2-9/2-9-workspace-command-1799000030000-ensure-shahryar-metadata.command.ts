import { Command } from 'nest-commander';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, In, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  SHAHRYAR_ADMIN_ROLE_SEED,
  SHAHRYAR_SUPERVISOR_OBJECT_PERMISSION_SEEDS,
  SHAHRYAR_SUPERVISOR_ROLE_SEED,
  SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/shahryar-role-seeds.constant';
import { DevSeederMetadataService } from 'src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service';

type ShahryarRoleSeed =
  | typeof SHAHRYAR_ADMIN_ROLE_SEED
  | typeof SHAHRYAR_SUPERVISOR_ROLE_SEED;

@RegisteredWorkspaceCommand('2.9.0', 1799000030000)
@Command({
  name: 'upgrade:2-9:ensure-shahryar-metadata',
  description:
    'Create missing Shahryar custom metadata, roles, object permissions, and supervisor row-level predicates on active and suspended workspaces',
})
export class EnsureShahryarMetadataCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly devSeederMetadataService: DevSeederMetadataService,
    private readonly objectPermissionService: ObjectPermissionService,
    private readonly roleService: RoleService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
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

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would ensure Shahryar metadata, roles, object permissions, and row-level predicates for workspace ${workspaceId}`,
      );

      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.devSeederMetadataService.seedShahryarMetadata({ workspaceId });

    const adminRole = await this.findOrCreateRole({
      input: SHAHRYAR_ADMIN_ROLE_SEED,
      ownerFlatApplication: workspaceCustomFlatApplication,
      workspaceId,
    });
    const supervisorRole = await this.findOrCreateRole({
      input: SHAHRYAR_SUPERVISOR_ROLE_SEED,
      ownerFlatApplication: workspaceCustomFlatApplication,
      workspaceId,
    });

    await this.upsertSupervisorObjectPermissions({
      supervisorRoleId: supervisorRole.id,
      workspaceId,
    });
    await this.seedMissingSupervisorRowLevelPermissionPredicates({
      ownerFlatApplication: workspaceCustomFlatApplication,
      supervisorRoleId: supervisorRole.id,
      workspaceId,
    });

    this.logger.log(
      `Ensured Shahryar metadata for workspace ${workspaceId} with roles ${adminRole.id} and ${supervisorRole.id}`,
    );
  }

  private async findOrCreateRole({
    input,
    ownerFlatApplication,
    workspaceId,
  }: {
    input: ShahryarRoleSeed;
    ownerFlatApplication: FlatApplication;
    workspaceId: string;
  }): Promise<RoleDTO | { id: string }> {
    const existingRole = (await this.roleService.getWorkspaceRoles(
      workspaceId,
    )).find((role) => role.label === input.label);

    if (isDefined(existingRole)) {
      return existingRole;
    }

    return await this.roleService.createRole({
      input,
      ownerFlatApplication,
      workspaceId,
    });
  }

  private async upsertSupervisorObjectPermissions({
    supervisorRoleId,
    workspaceId,
  }: {
    supervisorRoleId: string;
    workspaceId: string;
  }): Promise<void> {
    const objectMetadataByName = await this.findObjectMetadataByNames({
      objectNames: SHAHRYAR_SUPERVISOR_OBJECT_PERMISSION_SEEDS.map(
        (seed) => seed.objectName,
      ),
      workspaceId,
    });

    await this.objectPermissionService.upsertObjectPermissions({
      workspaceId,
      input: {
        roleId: supervisorRoleId,
        objectPermissions: SHAHRYAR_SUPERVISOR_OBJECT_PERMISSION_SEEDS.map(
          (seed) => {
            const objectMetadata = this.findObjectMetadataOrThrow({
              objectMetadataByName,
              objectName: seed.objectName,
            });

            return {
              objectMetadataId: objectMetadata.id,
              canReadObjectRecords: seed.canReadObjectRecords,
              canUpdateObjectRecords: seed.canUpdateObjectRecords,
              canSoftDeleteObjectRecords: seed.canSoftDeleteObjectRecords,
              canDestroyObjectRecords: seed.canDestroyObjectRecords,
            };
          },
        ),
      },
    });
  }

  private async seedMissingSupervisorRowLevelPermissionPredicates({
    ownerFlatApplication,
    supervisorRoleId,
    workspaceId,
  }: {
    ownerFlatApplication: FlatApplication;
    supervisorRoleId: string;
    workspaceId: string;
  }): Promise<void> {
    const objectMetadataByName = await this.findObjectMetadataByNames({
      objectNames: [
        ...SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS.map(
          (seed) => seed.objectName,
        ),
        'workspaceMember',
      ],
      workspaceId,
    });
    const workspaceMemberObjectMetadata = this.findObjectMetadataOrThrow({
      objectMetadataByName,
      objectName: 'workspaceMember',
    });
    const workspaceMemberIdFieldMetadata = this.findFieldMetadataOrThrow({
      fieldName: 'id',
      objectMetadata: workspaceMemberObjectMetadata,
    });
    const rowLevelPermissionPredicateRepository =
      this.coreDataSource.getRepository(RowLevelPermissionPredicateEntity);
    const existingPredicates =
      await rowLevelPermissionPredicateRepository.find({
        where: {
          roleId: supervisorRoleId,
          workspaceId,
        },
      });
    const existingPredicateKeys = new Set(
      existingPredicates.map(
        (predicate) =>
          `${predicate.objectMetadataId}.${predicate.fieldMetadataId}.${predicate.workspaceMemberFieldMetadataId ?? ''}`,
      ),
    );
    const predicatesToCreate =
      SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS.flatMap((seed) => {
        const objectMetadata = this.findObjectMetadataOrThrow({
          objectMetadataByName,
          objectName: seed.objectName,
        });
        const ownerFieldMetadata = this.findFieldMetadataOrThrow({
          fieldName: seed.ownerFieldName,
          objectMetadata,
        });
        const predicateKey = `${objectMetadata.id}.${ownerFieldMetadata.id}.${workspaceMemberIdFieldMetadata.id}`;

        if (existingPredicateKeys.has(predicateKey)) {
          return [];
        }

        const predicateId = v4();

        return [
          rowLevelPermissionPredicateRepository.create({
            id: predicateId,
            universalIdentifier: predicateId,
            workspaceId,
            applicationId: ownerFlatApplication.id,
            fieldMetadataId: ownerFieldMetadata.id,
            objectMetadataId: objectMetadata.id,
            operand: RowLevelPermissionPredicateOperand.IS,
            value: null,
            subFieldName: null,
            workspaceMemberFieldMetadataId: workspaceMemberIdFieldMetadata.id,
            workspaceMemberSubFieldName: null,
            rowLevelPermissionPredicateGroupId: null,
            positionInRowLevelPermissionPredicateGroup: null,
            roleId: supervisorRoleId,
          }),
        ];
      });

    if (predicatesToCreate.length === 0) {
      return;
    }

    await rowLevelPermissionPredicateRepository.save(predicatesToCreate);
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatRowLevelPermissionPredicateMaps',
      'rolesPermissions',
    ]);
  }

  private async findObjectMetadataByNames({
    objectNames,
    workspaceId,
  }: {
    objectNames: string[];
    workspaceId: string;
  }): Promise<Map<string, ObjectMetadataEntity>> {
    const objectMetadatas = await this.objectMetadataRepository.find({
      where: {
        nameSingular: In([...new Set(objectNames)]),
        workspaceId,
      },
      relations: {
        fields: true,
      },
    });

    return new Map(
      objectMetadatas.map((objectMetadata) => [
        objectMetadata.nameSingular,
        objectMetadata,
      ]),
    );
  }

  private findObjectMetadataOrThrow({
    objectMetadataByName,
    objectName,
  }: {
    objectMetadataByName: Map<string, ObjectMetadataEntity>;
    objectName: string;
  }): ObjectMetadataEntity {
    const objectMetadata = objectMetadataByName.get(objectName);

    if (!isDefined(objectMetadata)) {
      throw new Error(`Object metadata not found for: ${objectName}`);
    }

    return objectMetadata;
  }

  private findFieldMetadataOrThrow({
    fieldName,
    objectMetadata,
  }: {
    fieldName: string;
    objectMetadata: ObjectMetadataEntity;
  }) {
    const fieldMetadata = objectMetadata.fields.find(
      (field) => field.name === fieldName,
    );

    if (!isDefined(fieldMetadata)) {
      throw new Error(
        `Field metadata not found for: ${objectMetadata.nameSingular}.${fieldName}`,
      );
    }

    return fieldMetadata;
  }
}
