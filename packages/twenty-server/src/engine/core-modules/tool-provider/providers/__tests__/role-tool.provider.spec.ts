import { FieldActorSource } from 'twenty-shared/types';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RoleToolProvider } from 'src/engine/core-modules/tool-provider/providers/role-tool.provider';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type RoleService } from 'src/engine/metadata-modules/role/role.service';
import { RoleToolWorkspaceService } from 'src/engine/metadata-modules/role/tools/services/role-tool.workspace-service';
import { type RowLevelPermissionPredicateGroupService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate-group.service';
import { type RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import { type UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const workspaceId = 'workspace-id';
const callerRoleId = 'caller-role-id';
const callerWorkspaceMemberId = 'caller-workspace-member-id';
const callerUserWorkspaceId = 'caller-user-workspace-id';

type PartialFlatRole = Partial<FlatRole> &
  Pick<FlatRole, 'id' | 'label' | 'isEditable'>;

const createFlatRole = (overrides: PartialFlatRole): FlatRole =>
  ({
    universalIdentifier: overrides.id,
    canUpdateAllSettings: false,
    canAccessAllTools: false,
    canReadAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canDestroyAllObjectRecords: false,
    canBeAssignedToUsers: true,
    canBeAssignedToAgents: true,
    canBeAssignedToApiKeys: true,
    rolePermissionFlagIds: [],
    ...overrides,
  }) as FlatRole;

const createFlatEntityMapsKeyedById = <TEntity extends { id: string }>(
  entities: TEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.id, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.id]),
  ),
});

type BuildProviderOptions = {
  flatRoles?: FlatRole[];
  rolesPermissionFlagEntities?: {
    id: string;
    permissionFlagUniversalIdentifier: string;
  }[];
  hasRolesPermission?: boolean;
};

const buildProvider = (options?: BuildProviderOptions) => {
  const flatRoles = options?.flatRoles ?? [];

  const roleService = {
    getWorkspaceRoles: jest.fn().mockResolvedValue([]),
    createRole: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
  };
  const userRoleService = {
    assignRoleToManyUserWorkspace: jest.fn().mockResolvedValue(undefined),
  };
  const userWorkspaceService = {
    getWorkspaceMemberOrThrow: jest.fn(),
    getUserWorkspaceForUserOrThrow: jest.fn(),
  };
  const objectPermissionService = {
    upsertObjectPermissions: jest.fn().mockResolvedValue([]),
  };
  const rowLevelPermissionPredicateService = {
    findByWorkspaceId: jest.fn().mockResolvedValue([]),
    upsertRowLevelPermissionPredicates: jest
      .fn()
      .mockResolvedValue({ predicates: [], predicateGroups: [] }),
  };
  const rowLevelPermissionPredicateGroupService = {
    findByWorkspaceId: jest.fn().mockResolvedValue([]),
  };
  const applicationService = {
    findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
      .fn()
      .mockResolvedValue({
        workspaceCustomFlatApplication: {
          id: 'application-id',
          universalIdentifier: 'application-universal-identifier',
        },
      }),
  };
  const flatEntityMapsCacheService = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
      flatRoleMaps: createFlatEntityMapsKeyedById(flatRoles),
      flatRolePermissionFlagMaps: createFlatEntityMapsKeyedById(
        options?.rolesPermissionFlagEntities ?? [],
      ),
    }),
  };
  const permissionsService = {
    checkRolesPermissions: jest
      .fn()
      .mockResolvedValue(options?.hasRolesPermission ?? true),
  };

  const roleToolWorkspaceService = new RoleToolWorkspaceService(
    roleService as unknown as RoleService,
    userRoleService as unknown as UserRoleService,
    userWorkspaceService as unknown as UserWorkspaceService,
    objectPermissionService as unknown as ObjectPermissionService,
    rowLevelPermissionPredicateService as unknown as RowLevelPermissionPredicateService,
    rowLevelPermissionPredicateGroupService as unknown as RowLevelPermissionPredicateGroupService,
    applicationService as unknown as ApplicationService,
    flatEntityMapsCacheService as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
  );

  const provider = new RoleToolProvider(
    roleToolWorkspaceService,
    permissionsService as unknown as PermissionsService,
  );

  return {
    provider,
    roleService,
    userRoleService,
    userWorkspaceService,
    objectPermissionService,
    rowLevelPermissionPredicateService,
    rowLevelPermissionPredicateGroupService,
    permissionsService,
  };
};

const context: ToolProviderContext = {
  workspaceId,
  roleId: callerRoleId,
  rolePermissionConfig: { unionOf: [callerRoleId] },
  userWorkspaceId: callerUserWorkspaceId,
  actorContext: {
    source: FieldActorSource.MANUAL,
    workspaceMemberId: callerWorkspaceMemberId,
    name: 'Caller',
    context: {},
  },
};

describe('RoleToolProvider', () => {
  describe('isAvailable', () => {
    it('is available when the caller has the ROLES settings permission', async () => {
      const { provider, permissionsService } = buildProvider({
        hasRolesPermission: true,
      });

      await expect(provider.isAvailable(context)).resolves.toBe(true);
      expect(permissionsService.checkRolesPermissions).toHaveBeenCalledWith(
        context.rolePermissionConfig,
        workspaceId,
        PermissionFlagType.ROLES,
      );
    });

    it('is not available without the ROLES settings permission', async () => {
      const { provider } = buildProvider({ hasRolesPermission: false });

      await expect(provider.isAvailable(context)).resolves.toBe(false);
    });
  });

  describe('generateDescriptors', () => {
    it('exposes the role management tools', async () => {
      const { provider } = buildProvider();

      const descriptors = await provider.generateDescriptors(context, {
        includeSchemas: false,
      });

      expect(descriptors.map((descriptor) => descriptor.name)).toEqual(
        expect.arrayContaining([
          'list_roles',
          'create_role',
          'update_role',
          'delete_role',
          'assign_role_to_workspace_member',
          'upsert_object_permissions',
          'upsert_row_level_permission_rules',
        ]),
      );

      for (const descriptor of descriptors) {
        expect(descriptor.label).toBeDefined();
        expect(descriptor.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('list_roles', () => {
    it('returns the workspace roles', async () => {
      const { provider, roleService } = buildProvider();

      roleService.getWorkspaceRoles.mockResolvedValue([
        {
          id: 'role-1',
          label: 'Support',
          isEditable: true,
          objectPermissions: [],
          permissionFlags: [],
        },
      ]);

      const output = await provider.executeStaticTool(
        'list_roles',
        {},
        context,
      );

      expect(output.success).toBe(true);
      expect(roleService.getWorkspaceRoles).toHaveBeenCalledWith(workspaceId);
    });

    it('includes row-level permission rules when requested', async () => {
      const {
        provider,
        roleService,
        rowLevelPermissionPredicateService,
        rowLevelPermissionPredicateGroupService,
      } = buildProvider();

      roleService.getWorkspaceRoles.mockResolvedValue([
        { id: 'role-1', label: 'Support', isEditable: true },
      ]);
      rowLevelPermissionPredicateService.findByWorkspaceId.mockResolvedValue([
        { id: 'predicate-1', roleId: 'role-1' },
        { id: 'predicate-2', roleId: 'other-role' },
      ]);
      rowLevelPermissionPredicateGroupService.findByWorkspaceId.mockResolvedValue(
        [
          { id: 'group-1', roleId: 'role-1' },
          { id: 'group-2', roleId: 'other-role' },
        ],
      );

      const output = await provider.executeStaticTool(
        'list_roles',
        { includeRowLevelPermissionRules: true },
        context,
      );

      expect(output.success).toBe(true);

      const { roles } = output.result as {
        roles: {
          rowLevelPermissionPredicates: { id: string }[];
          rowLevelPermissionPredicateGroups: { id: string }[];
        }[];
      };

      expect(roles[0].rowLevelPermissionPredicates).toEqual([
        { id: 'predicate-1', roleId: 'role-1' },
      ]);
      expect(roles[0].rowLevelPermissionPredicateGroups).toEqual([
        { id: 'group-1', roleId: 'role-1' },
      ]);
    });

    it('fetches predicates and groups once for the workspace, not per role', async () => {
      const {
        provider,
        roleService,
        rowLevelPermissionPredicateService,
        rowLevelPermissionPredicateGroupService,
      } = buildProvider();

      roleService.getWorkspaceRoles.mockResolvedValue([
        { id: 'role-1', label: 'Support', isEditable: true },
        { id: 'role-2', label: 'Sales', isEditable: true },
        { id: 'role-3', label: 'Guest', isEditable: true },
      ]);

      await provider.executeStaticTool(
        'list_roles',
        { includeRowLevelPermissionRules: true },
        context,
      );

      expect(
        rowLevelPermissionPredicateService.findByWorkspaceId,
      ).toHaveBeenCalledTimes(1);
      expect(
        rowLevelPermissionPredicateGroupService.findByWorkspaceId,
      ).toHaveBeenCalledTimes(1);
      expect(
        rowLevelPermissionPredicateGroupService.findByWorkspaceId,
      ).toHaveBeenCalledWith(workspaceId);
    });
  });

  describe('create_role', () => {
    it('creates a role through the role service', async () => {
      const { provider, roleService } = buildProvider();

      roleService.createRole.mockResolvedValue({
        id: 'new-role-id',
        label: 'Sales',
      });

      const output = await provider.executeStaticTool(
        'create_role',
        { label: 'Sales', canReadAllObjectRecords: true },
        context,
      );

      expect(output.success).toBe(true);
      expect(roleService.createRole).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId,
          input: expect.objectContaining({
            label: 'Sales',
            canReadAllObjectRecords: true,
          }),
        }),
      );
    });

    it('surfaces the underlying validation errors from a failed migration build', async () => {
      const { provider, roleService } = buildProvider();

      roleService.createRole.mockRejectedValue(
        new WorkspaceMigrationBuilderException(
          {
            status: 'fail',
            report: {
              role: [
                {
                  flatEntityMinimalInformation: { label: 'Sales' },
                  errors: [
                    { code: 'INVALID', message: 'Role label already exists' },
                  ],
                },
              ],
            },
          } as unknown as ConstructorParameters<
            typeof WorkspaceMigrationBuilderException
          >[0],
          'Multiple validation errors occurred while creating role',
        ),
      );

      const output = await provider.executeStaticTool(
        'create_role',
        { label: 'Sales' },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('Role label already exists');
      expect(output.error).toContain('Sales');
    });
  });

  describe('update_role', () => {
    it('rejects updating a system-managed role like Admin', async () => {
      const { provider, roleService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: 'admin-role-id',
            label: 'Admin',
            isEditable: false,
          }),
        ],
      });

      const output = await provider.executeStaticTool(
        'update_role',
        { roleId: 'admin-role-id', update: { label: 'Renamed' } },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('system-managed');
      expect(roleService.updateRole).not.toHaveBeenCalled();
    });

    it('rejects an update that would lock the caller out of role management', async () => {
      const { provider, roleService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: callerRoleId,
            label: 'Manager',
            isEditable: true,
            canUpdateAllSettings: true,
          }),
        ],
      });

      const output = await provider.executeStaticTool(
        'update_role',
        { roleId: callerRoleId, update: { canUpdateAllSettings: false } },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('lock you out');
      expect(roleService.updateRole).not.toHaveBeenCalled();
    });

    it('allows removing settings access from the caller role when it keeps an explicit ROLES flag', async () => {
      const rolePermissionFlagId = 'role-permission-flag-id';
      const { provider, roleService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: callerRoleId,
            label: 'Manager',
            isEditable: true,
            canUpdateAllSettings: true,
            rolePermissionFlagIds: [rolePermissionFlagId],
          }),
        ],
        rolesPermissionFlagEntities: [
          {
            id: rolePermissionFlagId,
            permissionFlagUniversalIdentifier: SystemPermissionFlag.ROLES,
          },
        ],
      });

      roleService.updateRole.mockResolvedValue({
        id: callerRoleId,
        label: 'Manager',
      });

      const output = await provider.executeStaticTool(
        'update_role',
        { roleId: callerRoleId, update: { canUpdateAllSettings: false } },
        context,
      );

      expect(output.success).toBe(true);
      expect(roleService.updateRole).toHaveBeenCalled();
    });

    it('updates another editable role', async () => {
      const { provider, roleService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: 'other-role-id',
            label: 'Support',
            isEditable: true,
            canUpdateAllSettings: true,
          }),
        ],
      });

      roleService.updateRole.mockResolvedValue({
        id: 'other-role-id',
        label: 'Support',
      });

      const output = await provider.executeStaticTool(
        'update_role',
        {
          roleId: 'other-role-id',
          update: { canUpdateAllSettings: false, label: 'Support L1' },
        },
        context,
      );

      expect(output.success).toBe(true);
      expect(roleService.updateRole).toHaveBeenCalledWith({
        workspaceId,
        input: {
          id: 'other-role-id',
          update: { canUpdateAllSettings: false, label: 'Support L1' },
        },
      });
    });

    it('fails when the role does not exist', async () => {
      const { provider, roleService } = buildProvider({ flatRoles: [] });

      const output = await provider.executeStaticTool(
        'update_role',
        { roleId: 'ba49ef7c-6b55-4a0a-a3d3-e16702c1a520', update: {} },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('not found');
      expect(roleService.updateRole).not.toHaveBeenCalled();
    });
  });

  describe('delete_role', () => {
    it('rejects deleting a system-managed role like Admin', async () => {
      const { provider, roleService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: 'admin-role-id',
            label: 'Admin',
            isEditable: false,
          }),
        ],
      });

      const output = await provider.executeStaticTool(
        'delete_role',
        { roleId: 'admin-role-id' },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('system-managed');
      expect(roleService.deleteRole).not.toHaveBeenCalled();
    });

    it('rejects deleting the role the caller is acting under', async () => {
      const { provider, roleService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: callerRoleId,
            label: 'Manager',
            isEditable: true,
          }),
        ],
      });

      const output = await provider.executeStaticTool(
        'delete_role',
        { roleId: callerRoleId },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('acting under');
      expect(roleService.deleteRole).not.toHaveBeenCalled();
    });

    it('deletes another editable role', async () => {
      const { provider, roleService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: 'other-role-id',
            label: 'Support',
            isEditable: true,
          }),
        ],
      });

      roleService.deleteRole.mockResolvedValue({
        id: 'other-role-id',
        label: 'Support',
      });

      const output = await provider.executeStaticTool(
        'delete_role',
        { roleId: 'other-role-id' },
        context,
      );

      expect(output.success).toBe(true);
      expect(roleService.deleteRole).toHaveBeenCalledWith({
        roleId: 'other-role-id',
        workspaceId,
      });
    });
  });

  describe('assign_role_to_workspace_member', () => {
    const assignableRole = createFlatRole({
      id: 'other-role-id',
      label: 'Support',
      isEditable: true,
      canBeAssignedToUsers: true,
    });

    it('rejects assigning a role to the caller themselves', async () => {
      const { provider, userRoleService } = buildProvider({
        flatRoles: [assignableRole],
      });

      const output = await provider.executeStaticTool(
        'assign_role_to_workspace_member',
        {
          workspaceMemberId: callerWorkspaceMemberId,
          roleId: 'other-role-id',
        },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('your own role');
      expect(
        userRoleService.assignRoleToManyUserWorkspace,
      ).not.toHaveBeenCalled();
    });

    it('rejects assigning a role to the caller resolved through user workspace', async () => {
      const { provider, userRoleService, userWorkspaceService } = buildProvider(
        { flatRoles: [assignableRole] },
      );

      userWorkspaceService.getWorkspaceMemberOrThrow.mockResolvedValue({
        id: 'target-member-id',
        userId: 'caller-user-id',
        name: { firstName: 'Same', lastName: 'User' },
      });
      userWorkspaceService.getUserWorkspaceForUserOrThrow.mockResolvedValue({
        id: callerUserWorkspaceId,
      });

      const output = await provider.executeStaticTool(
        'assign_role_to_workspace_member',
        { workspaceMemberId: 'target-member-id', roleId: 'other-role-id' },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('your own role');
      expect(
        userRoleService.assignRoleToManyUserWorkspace,
      ).not.toHaveBeenCalled();
    });

    it('rejects a role that cannot be assigned to users', async () => {
      const { provider, userRoleService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: 'agent-only-role-id',
            label: 'Agent only',
            isEditable: true,
            canBeAssignedToUsers: false,
          }),
        ],
      });

      const output = await provider.executeStaticTool(
        'assign_role_to_workspace_member',
        {
          workspaceMemberId: 'target-member-id',
          roleId: 'agent-only-role-id',
        },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('cannot be assigned to users');
      expect(
        userRoleService.assignRoleToManyUserWorkspace,
      ).not.toHaveBeenCalled();
    });

    it('assigns a role to another workspace member', async () => {
      const { provider, userRoleService, userWorkspaceService } = buildProvider(
        { flatRoles: [assignableRole] },
      );

      userWorkspaceService.getWorkspaceMemberOrThrow.mockResolvedValue({
        id: 'target-member-id',
        userId: 'target-user-id',
        name: { firstName: 'Jane', lastName: 'Doe' },
      });
      userWorkspaceService.getUserWorkspaceForUserOrThrow.mockResolvedValue({
        id: 'target-user-workspace-id',
      });

      const output = await provider.executeStaticTool(
        'assign_role_to_workspace_member',
        { workspaceMemberId: 'target-member-id', roleId: 'other-role-id' },
        context,
      );

      expect(output.success).toBe(true);
      expect(
        userRoleService.assignRoleToManyUserWorkspace,
      ).toHaveBeenCalledWith({
        workspaceId,
        userWorkspaceIds: ['target-user-workspace-id'],
        roleId: 'other-role-id',
      });
    });
  });

  describe('upsert_object_permissions', () => {
    it('rejects changes on a system-managed role', async () => {
      const { provider, objectPermissionService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: 'admin-role-id',
            label: 'Admin',
            isEditable: false,
          }),
        ],
      });

      const output = await provider.executeStaticTool(
        'upsert_object_permissions',
        {
          roleId: 'admin-role-id',
          objectPermissions: [
            {
              objectMetadataId: 'object-metadata-id',
              canReadObjectRecords: true,
            },
          ],
        },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('system-managed');
      expect(
        objectPermissionService.upsertObjectPermissions,
      ).not.toHaveBeenCalled();
    });

    it('upserts object permission overrides on an editable role', async () => {
      const { provider, objectPermissionService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: 'support-role-id',
            label: 'Support',
            isEditable: true,
          }),
        ],
      });

      objectPermissionService.upsertObjectPermissions.mockResolvedValue([
        {
          objectMetadataId: 'object-metadata-id',
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
        },
      ]);

      const output = await provider.executeStaticTool(
        'upsert_object_permissions',
        {
          roleId: 'support-role-id',
          objectPermissions: [
            {
              objectMetadataId: 'object-metadata-id',
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        },
        context,
      );

      expect(output.success).toBe(true);
      expect(
        objectPermissionService.upsertObjectPermissions,
      ).toHaveBeenCalledWith({
        workspaceId,
        input: {
          roleId: 'support-role-id',
          objectPermissions: [
            {
              objectMetadataId: 'object-metadata-id',
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        },
      });
    });
  });

  describe('upsert_row_level_permission_rules', () => {
    it('rejects changes on a system-managed role', async () => {
      const { provider, rowLevelPermissionPredicateService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: 'admin-role-id',
            label: 'Admin',
            isEditable: false,
          }),
        ],
      });

      const output = await provider.executeStaticTool(
        'upsert_row_level_permission_rules',
        {
          roleId: 'admin-role-id',
          objectMetadataId: 'object-metadata-id',
          predicates: [],
          predicateGroups: [],
        },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('system-managed');
      expect(
        rowLevelPermissionPredicateService.upsertRowLevelPermissionPredicates,
      ).not.toHaveBeenCalled();
    });

    it('upserts predicates and injects the object metadata id into groups', async () => {
      const { provider, rowLevelPermissionPredicateService } = buildProvider({
        flatRoles: [
          createFlatRole({
            id: 'support-role-id',
            label: 'Support',
            isEditable: true,
          }),
        ],
      });

      const output = await provider.executeStaticTool(
        'upsert_row_level_permission_rules',
        {
          roleId: 'support-role-id',
          objectMetadataId: 'object-metadata-id',
          predicates: [
            {
              fieldMetadataId: 'owner-field-metadata-id',
              operand: 'IS',
              workspaceMemberFieldMetadataId:
                'workspace-member-id-field-metadata-id',
              rowLevelPermissionPredicateGroupId: 'group-id',
            },
          ],
          predicateGroups: [{ id: 'group-id', logicalOperator: 'AND' }],
        },
        context,
      );

      expect(output.success).toBe(true);
      expect(
        rowLevelPermissionPredicateService.upsertRowLevelPermissionPredicates,
      ).toHaveBeenCalledWith({
        workspaceId,
        input: expect.objectContaining({
          roleId: 'support-role-id',
          objectMetadataId: 'object-metadata-id',
          predicateGroups: [
            expect.objectContaining({
              id: 'group-id',
              logicalOperator: 'AND',
              objectMetadataId: 'object-metadata-id',
            }),
          ],
        }),
      });
    });
  });
});
