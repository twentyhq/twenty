import { ToolCategory } from 'twenty-shared/ai';

import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type DefinedToolRegistryService } from 'src/engine/core-modules/tool-provider/services/defined-tool-registry.service';
import { type ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolOutputSpillService } from 'src/engine/core-modules/tool/services/tool-output-spill.service';

const workspaceId = 'workspace-id';

const buildToolRegistryService = () => {
  const generateDescriptors = jest.fn().mockResolvedValue([]);
  const generateWorkflowDescriptors = jest.fn().mockResolvedValue([]);
  const definedToolRegistryService = {
    getAvailableDescriptors: jest.fn().mockResolvedValue([]),
    findDefinedTool: jest.fn(),
  };

  const toolRegistryService = new ToolRegistryService(
    [
      {
        category: ToolCategory.DATABASE_CRUD,
        canRunUnderScope: true,
        isAvailable: jest.fn().mockResolvedValue(true),
        generateDescriptors,
        executeStaticTool: jest.fn(),
      },
      {
        category: ToolCategory.WORKFLOW,
        canRunUnderScope: false,
        isAvailable: jest.fn().mockResolvedValue(true),
        generateDescriptors: generateWorkflowDescriptors,
        executeStaticTool: jest.fn(),
      },
    ],
    definedToolRegistryService as unknown as DefinedToolRegistryService,
    {} as ToolExecutorService,
    {} as ToolOutputSpillService,
    {} as ExceptionHandlerService,
  );

  return {
    toolRegistryService,
    generateDescriptors,
    generateWorkflowDescriptors,
  };
};

describe('ToolRegistryService', () => {
  describe('getCatalog', () => {
    it('should keep the explicit object grants when the context resolves to a fresh one', async () => {
      const { toolRegistryService, generateDescriptors } =
        buildToolRegistryService();
      const resolvedContext: ToolProviderContext = {
        workspaceId,
        rolePermissionConfig: {
          intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
        },
      };

      await toolRegistryService.getCatalog({
        workspaceId,
        rolePermissionConfig: {
          intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
        },
        explicitObjectGrants: { canReadAllObjectRecords: true },
        resolveExecutionContext: async () => resolvedContext,
      });

      expect(generateDescriptors).toHaveBeenCalledWith(
        expect.objectContaining({
          explicitObjectGrants: { canReadAllObjectRecords: true },
        }),
        expect.anything(),
      );
    });
  });

  describe('getCatalog under a permission scope', () => {
    const memberRolePermissionConfig = {
      intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
    };

    it('should consult every provider for a caller without a scope', async () => {
      const { toolRegistryService, generateWorkflowDescriptors } =
        buildToolRegistryService();

      await toolRegistryService.getCatalog({
        workspaceId,
        rolePermissionConfig: memberRolePermissionConfig,
      });

      expect(generateWorkflowDescriptors).toHaveBeenCalled();
    });

    it('should skip the providers that do not honour the scope of the caller', async () => {
      const {
        toolRegistryService,
        generateDescriptors,
        generateWorkflowDescriptors,
      } = buildToolRegistryService();

      await toolRegistryService.getCatalog({
        workspaceId,
        rolePermissionConfig: {
          ...memberRolePermissionConfig,
          scope: { objectsPermissions: {}, permissionFlags: {} },
        },
      });

      expect(generateDescriptors).toHaveBeenCalled();
      expect(generateWorkflowDescriptors).not.toHaveBeenCalled();
    });
  });
});
