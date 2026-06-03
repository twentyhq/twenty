import { type DataSource, type Repository } from 'typeorm';

import { EnsureShahryarMetadataCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000030000-ensure-shahryar-metadata.command';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
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

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const WORKSPACE_CUSTOM_FLAT_APPLICATION = {
  id: 'workspace-custom-application-id',
  universalIdentifier: 'workspace-custom-application-universal-id',
} as FlatApplication;

const createObjectMetadata = ({
  fieldNames,
  objectName,
}: {
  fieldNames: string[];
  objectName: string;
}): ObjectMetadataEntity =>
  ({
    id: `${objectName}-object-id`,
    fields: fieldNames.map((fieldName) => ({
      id: `${objectName}-${fieldName}-field-id`,
      name: fieldName,
    })),
    nameSingular: objectName,
  }) as ObjectMetadataEntity;

const createShahryarObjectMetadataRows = (): ObjectMetadataEntity[] => [
  createObjectMetadata({
    fieldNames: ['id'],
    objectName: 'workspaceMember',
  }),
  ...SHAHRYAR_SUPERVISOR_OBJECT_PERMISSION_SEEDS.map((permissionSeed) => {
    const rowLevelPermissionSeed =
      SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS.find(
        (seed) => seed.objectName === permissionSeed.objectName,
      );

    return createObjectMetadata({
      fieldNames:
        rowLevelPermissionSeed === undefined
          ? []
          : [rowLevelPermissionSeed.ownerFieldName],
      objectName: permissionSeed.objectName,
    });
  }),
];

const createRole = ({
  id,
  label,
}: {
  id: string;
  label: string;
}): RoleEntity =>
  ({
    id,
    label,
  }) as RoleEntity;

const createExistingPredicate = (): RowLevelPermissionPredicateEntity => {
  const seed = SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS[0];

  return {
    objectMetadataId: `${seed.objectName}-object-id`,
    fieldMetadataId: `${seed.objectName}-${seed.ownerFieldName}-field-id`,
    workspaceMemberFieldMetadataId: 'workspaceMember-id-field-id',
  } as RowLevelPermissionPredicateEntity;
};

const setupCommand = ({
  existingPredicates = [],
  existingRoles = [],
}: {
  existingPredicates?: RowLevelPermissionPredicateEntity[];
  existingRoles?: RoleEntity[];
} = {}) => {
  const findWorkspaceApplications = jest
    .fn<
      Promise<{ workspaceCustomFlatApplication: FlatApplication }>,
      [{ workspaceId: string }]
    >()
    .mockResolvedValue({
      workspaceCustomFlatApplication: WORKSPACE_CUSTOM_FLAT_APPLICATION,
    });
  const seedShahryarMetadata = jest
    .fn<Promise<void>, [{ workspaceId: string }]>()
    .mockResolvedValue(undefined);
  const upsertObjectPermissions = jest
    .fn<
      Promise<void>,
      [Parameters<ObjectPermissionService['upsertObjectPermissions']>[0]]
    >()
    .mockResolvedValue(undefined);
  const getWorkspaceRoles = jest
    .fn<Promise<RoleEntity[]>, [string]>()
    .mockResolvedValue(existingRoles);
  const createRoleMock = jest
    .fn<Promise<RoleDTO>, [Parameters<RoleService['createRole']>[0]]>()
    .mockImplementation(async ({ input }) => {
      return {
        id: `${input.label}-role-id`,
        label: input.label,
      } as RoleDTO;
    });
  const findObjectMetadata = jest
    .fn<Promise<ObjectMetadataEntity[]>, [Parameters<Repository<ObjectMetadataEntity>['find']>[0]]>()
    .mockResolvedValue(createShahryarObjectMetadataRows());
  const savePredicates = jest
    .fn<
      Promise<RowLevelPermissionPredicateEntity[]>,
      [RowLevelPermissionPredicateEntity[]]
    >()
    .mockImplementation(async (predicates) => predicates);
  const createPredicate = jest
    .fn<
      RowLevelPermissionPredicateEntity,
      [Partial<RowLevelPermissionPredicateEntity>]
    >()
    .mockImplementation(
      (predicate) => predicate as RowLevelPermissionPredicateEntity,
    );
  const findPredicates = jest
    .fn<Promise<RowLevelPermissionPredicateEntity[]>, [unknown]>()
    .mockResolvedValue(existingPredicates);
  const invalidateAndRecompute = jest
    .fn<Promise<void>, [string, string[]]>()
    .mockResolvedValue(undefined);
  const command = new EnsureShahryarMetadataCommand(
    {} as ConstructorParameters<typeof EnsureShahryarMetadataCommand>[0],
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
        findWorkspaceApplications,
    } as unknown as ApplicationService,
    {
      seedShahryarMetadata,
    } as unknown as DevSeederMetadataService,
    {
      upsertObjectPermissions,
    } as unknown as ObjectPermissionService,
    {
      createRole: createRoleMock,
      getWorkspaceRoles,
    } as unknown as RoleService,
    {
      invalidateAndRecompute,
    } as unknown as WorkspaceCacheService,
    {
      find: findObjectMetadata,
    } as unknown as Repository<ObjectMetadataEntity>,
    {
      getRepository: () =>
        ({
          create: createPredicate,
          find: findPredicates,
          save: savePredicates,
        }) as unknown as Repository<RowLevelPermissionPredicateEntity>,
    } as unknown as DataSource,
  );

  return {
    command,
    createRoleMock,
    findPredicates,
    findWorkspaceApplications,
    invalidateAndRecompute,
    savePredicates,
    seedShahryarMetadata,
    upsertObjectPermissions,
  };
};

describe('EnsureShahryarMetadataCommand', () => {
  it('should skip changes during dry runs', async () => {
    const { command, findWorkspaceApplications, seedShahryarMetadata } =
      setupCommand();

    await command.runOnWorkspace({
      dataSource: undefined,
      index: 0,
      options: { dryRun: true },
      total: 1,
      workspaceId: WORKSPACE_ID,
    });

    expect(findWorkspaceApplications).not.toHaveBeenCalled();
    expect(seedShahryarMetadata).not.toHaveBeenCalled();
  });

  it('should ensure Shahryar metadata, roles, object permissions, and predicates', async () => {
    const {
      command,
      createRoleMock,
      invalidateAndRecompute,
      savePredicates,
      seedShahryarMetadata,
      upsertObjectPermissions,
    } = setupCommand();

    await command.runOnWorkspace({
      dataSource: undefined,
      index: 0,
      options: {},
      total: 1,
      workspaceId: WORKSPACE_ID,
    });

    expect(seedShahryarMetadata).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
    });
    expect(createRoleMock).toHaveBeenCalledTimes(2);
    expect(createRoleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: SHAHRYAR_ADMIN_ROLE_SEED,
      }),
    );
    expect(createRoleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: SHAHRYAR_SUPERVISOR_ROLE_SEED,
      }),
    );
    expect(upsertObjectPermissions).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          objectPermissions: expect.arrayContaining([
            expect.objectContaining({
              objectMetadataId: 'shahryarMarket-object-id',
            }),
          ]),
        }),
        workspaceId: WORKSPACE_ID,
      }),
    );
    expect(savePredicates.mock.calls[0][0]).toHaveLength(
      SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS.length,
    );
    expect(invalidateAndRecompute).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatRowLevelPermissionPredicateMaps',
      'rolesPermissions',
    ]);
  });

  it('should reuse existing roles and only create missing predicates', async () => {
    const { command, createRoleMock, savePredicates } = setupCommand({
      existingPredicates: [createExistingPredicate()],
      existingRoles: [
        createRole({
          id: 'existing-admin-role-id',
          label: SHAHRYAR_ADMIN_ROLE_SEED.label,
        }),
        createRole({
          id: 'existing-supervisor-role-id',
          label: SHAHRYAR_SUPERVISOR_ROLE_SEED.label,
        }),
      ],
    });

    await command.runOnWorkspace({
      dataSource: undefined,
      index: 0,
      options: {},
      total: 1,
      workspaceId: WORKSPACE_ID,
    });

    expect(createRoleMock).not.toHaveBeenCalled();
    expect(savePredicates.mock.calls[0][0]).toHaveLength(
      SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS.length - 1,
    );
  });
});
