import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { type Repository } from 'typeorm';

import { type ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolOutputSpillService } from 'src/engine/core-modules/tool/services/tool-output-spill.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('ToolRegistryService', () => {
  it('deduplicates permission role loads within a catalog build only', async () => {
    const roleRepository = {
      find: jest.fn().mockResolvedValue([
        {
          id: 'role-id',
          canAccessAllTools: true,
          canUpdateAllSettings: true,
          rolePermissionFlags: [],
        } as RoleEntity,
      ]),
    } as unknown as WorkspaceScopedRepository<RoleEntity>;
    const permissionsService = new PermissionsService(
      {} as UserRoleService,
      {} as WorkspaceCacheService,
      {} as ApiKeyRoleService,
      roleRepository,
      {} as Repository<ApplicationEntity>,
    );
    const createProvider = (category: ToolCategory): ToolProvider => ({
      category,
      isAvailable: async (context) => {
        const hasSettingsPermission =
          await permissionsService.checkRolesPermissions(
            context.rolePermissionConfig,
            context.workspaceId,
            PermissionFlagType.DATA_MODEL,
            context.permissionsEvaluationContext,
          );
        const hasToolPermission = await permissionsService.hasToolPermission(
          context.rolePermissionConfig,
          context.workspaceId,
          PermissionFlagType.HTTP_REQUEST_TOOL,
          context.permissionsEvaluationContext,
        );

        return hasSettingsPermission && hasToolPermission;
      },
      generateDescriptors: async (context) => {
        await permissionsService.checkRolesPermissions(
          context.rolePermissionConfig,
          context.workspaceId,
          PermissionFlagType.WORKFLOWS,
          context.permissionsEvaluationContext,
        );

        return [];
      },
      executeStaticTool: jest.fn(),
    });
    const registry = new ToolRegistryService(
      [
        createProvider(ToolCategory.ACTION),
        createProvider(ToolCategory.METADATA),
      ],
      {} as ToolExecutorService,
      {} as ToolOutputSpillService,
    );
    const context: ToolProviderContext = {
      workspaceId: 'workspace-id',
      roleId: 'role-id',
      rolePermissionConfig: { unionOf: ['role-id'] },
    };

    await registry.getCatalog(context);

    expect(roleRepository.find).toHaveBeenCalledTimes(1);

    await registry.getCatalog(context);

    expect(roleRepository.find).toHaveBeenCalledTimes(2);
  });
});
