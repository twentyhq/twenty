import { PermissionFlagType } from 'twenty-shared/constants';
import { FieldActorSource } from 'twenty-shared/types';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { RoleToolProvider } from 'src/engine/core-modules/tool-provider/providers/role-tool.provider';
import { type ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type RoleService } from 'src/engine/metadata-modules/role/role.service';
import { RoleToolWorkspaceService } from 'src/engine/metadata-modules/role/tools/services/role-tool.workspace-service';
import { type RowLevelPermissionPredicateGroupService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate-group.service';
import { type RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import { type UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const workspaceId = 'workspace-id';
const callerRoleId = 'caller-role-id';
const callerUserWorkspaceId = 'caller-user-workspace-id';

const buildProvider = (options?: { hasRolesPermission?: boolean }) => {
  const roleService = {
    getWorkspaceRoles: jest.fn().mockResolvedValue([]),
    createRole: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
  };
  const userRoleService = {
    assignRoleToWorkspaceMember: jest.fn().mockResolvedValue({
      workspaceMember: {
        id: 'target-member-id',
        userId: 'target-user-id',
        name: { firstName: 'Jane', lastName: 'Doe' },
      },
      userWorkspaceId: 'target-user-workspace-id',
    }),
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
  const permissionsService = {
    checkRolesPermissions: jest
      .fn()
      .mockResolvedValue(options?.hasRolesPermission ?? true),
  };

  const roleToolWorkspaceService = new RoleToolWorkspaceService(
    roleService as unknown as RoleService,
    userRoleService as unknown as UserRoleService,
    objectPermissionService as unknown as ObjectPermissionService,
    rowLevelPermissionPredicateService as unknown as RowLevelPermissionPredicateService,
    rowLevelPermissionPredicateGroupService as unknown as RowLevelPermissionPredicateGroupService,
    applicationService as unknown as ApplicationService,
  );

  const provider = new RoleToolProvider(
    roleToolWorkspaceService,
    permissionsService as unknown as PermissionsService,
  );

  return {
    provider,
    roleService,
    userRoleService,
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
    workspaceMemberId: 'caller-workspace-member-id',
    applicationUniversalIdentifier: null,
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
    it('updates the role, forwarding the caller roles for lockout protection', async () => {
      const { provider, roleService } = buildProvider();

      roleService.updateRole.mockResolvedValue({
        id: 'other-role-id',
        label: 'Support L1',
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
        actingRoleIds: [callerRoleId],
      });
    });

    it('surfaces service rejections such as lockout protection', async () => {
      const { provider, roleService } = buildProvider();

      roleService.updateRole.mockRejectedValue(
        new PermissionsException(
          PermissionsExceptionMessage.CANNOT_REVOKE_OWN_SETTINGS_ACCESS,
          PermissionsExceptionCode.CANNOT_REVOKE_OWN_SETTINGS_ACCESS,
        ),
      );

      const output = await provider.executeStaticTool(
        'update_role',
        { roleId: callerRoleId, update: { canUpdateAllSettings: false } },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain(
        PermissionsExceptionMessage.CANNOT_REVOKE_OWN_SETTINGS_ACCESS,
      );
    });
  });

  describe('delete_role', () => {
    it('deletes the role, forwarding the caller roles for lockout protection', async () => {
      const { provider, roleService } = buildProvider();

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
        actingRoleIds: [callerRoleId],
      });
    });

    it('surfaces service rejections such as deleting an own role', async () => {
      const { provider, roleService } = buildProvider();

      roleService.deleteRole.mockRejectedValue(
        new PermissionsException(
          PermissionsExceptionMessage.CANNOT_DELETE_OWN_ROLE,
          PermissionsExceptionCode.CANNOT_DELETE_OWN_ROLE,
        ),
      );

      const output = await provider.executeStaticTool(
        'delete_role',
        { roleId: callerRoleId },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain(
        PermissionsExceptionMessage.CANNOT_DELETE_OWN_ROLE,
      );
    });
  });

  describe('assign_role_to_workspace_member', () => {
    it('delegates to the user role service with the acting user workspace', async () => {
      const { provider, userRoleService } = buildProvider();

      const output = await provider.executeStaticTool(
        'assign_role_to_workspace_member',
        { workspaceMemberId: 'target-member-id', roleId: 'other-role-id' },
        context,
      );

      expect(output.success).toBe(true);
      expect(userRoleService.assignRoleToWorkspaceMember).toHaveBeenCalledWith({
        workspaceId,
        workspaceMemberId: 'target-member-id',
        roleId: 'other-role-id',
        actingUserWorkspaceId: callerUserWorkspaceId,
      });
    });

    it('surfaces service rejections such as changing your own role', async () => {
      const { provider, userRoleService } = buildProvider();

      userRoleService.assignRoleToWorkspaceMember.mockRejectedValue(
        new PermissionsException(
          PermissionsExceptionMessage.CANNOT_UPDATE_SELF_ROLE,
          PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE,
        ),
      );

      const output = await provider.executeStaticTool(
        'assign_role_to_workspace_member',
        {
          workspaceMemberId: 'caller-workspace-member-id',
          roleId: 'other-role-id',
        },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain(
        PermissionsExceptionMessage.CANNOT_UPDATE_SELF_ROLE,
      );
    });
  });

  describe('upsert_object_permissions', () => {
    it('upserts object permission overrides through the service', async () => {
      const { provider, objectPermissionService } = buildProvider();

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
    it('upserts predicates and injects the object metadata id into groups', async () => {
      const { provider, rowLevelPermissionPredicateService } = buildProvider();

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

    it('surfaces service rejections such as cross-role ownership violations', async () => {
      const { provider, rowLevelPermissionPredicateService } = buildProvider();

      rowLevelPermissionPredicateService.upsertRowLevelPermissionPredicates.mockRejectedValue(
        new Error(
          'Predicate "foreign-predicate-id" belongs to a different role or object and cannot be modified here.',
        ),
      );

      const output = await provider.executeStaticTool(
        'upsert_row_level_permission_rules',
        {
          roleId: 'support-role-id',
          objectMetadataId: 'object-metadata-id',
          predicates: [],
          predicateGroups: [],
        },
        context,
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('different role or object');
    });
  });
});
