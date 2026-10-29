import { ToolCategory } from 'twenty-shared/ai';

import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type DefinedToolRegistryService } from 'src/engine/core-modules/tool-provider/services/defined-tool-registry.service';
import { type ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolOutputSpillService } from 'src/engine/core-modules/tool/services/tool-output-spill.service';

const workspaceId = 'workspace-id';
const agentRoleId = 'agent-role-id';

const buildToolRegistryService = (catalogToolNames: string[] = []) => {
  const generateDescriptors = jest
    .fn()
    .mockResolvedValue(catalogToolNames.map((name) => ({ name })));
  const definedToolRegistryService = {
    getAvailableDescriptors: jest.fn().mockResolvedValue([]),
    findDefinedTool: jest.fn(),
  };

  const toolRegistryService = new ToolRegistryService(
    [
      {
        category: ToolCategory.DATABASE_CRUD,
        isAvailable: jest.fn().mockResolvedValue(true),
        generateDescriptors,
        executeStaticTool: jest.fn(),
      },
    ],
    definedToolRegistryService as unknown as DefinedToolRegistryService,
    {} as ToolExecutorService,
    {} as ToolOutputSpillService,
    {} as ExceptionHandlerService,
  );

  return { toolRegistryService, generateDescriptors };
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
        explicitObjectGrantsRoleId: agentRoleId,
        resolveExecutionContext: async () => resolvedContext,
      });

      expect(generateDescriptors).toHaveBeenCalledWith(
        expect.objectContaining({ explicitObjectGrantsRoleId: agentRoleId }),
        expect.anything(),
      );
    });
  });

  describe('suggestSimilarToolNames', () => {
    it('should rank only allowed tools so a disallowed match never takes a suggestion slot', async () => {
      const { toolRegistryService } = buildToolRegistryService([
        'create_one_note',
        'delete_one_note',
        'update_one_note',
        'create_one_note_target',
      ]);
      const allowed = new Set(['create_one_note', 'create_one_note_target']);

      const suggestions = await toolRegistryService.suggestSimilarToolNames(
        ['create_one_noteTarget'],
        {
          workspaceId,
          rolePermissionConfig: {
            intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
          },
        },
        (toolName) => allowed.has(toolName),
      );

      expect(suggestions).toEqual({
        create_one_noteTarget: ['create_one_note_target', 'create_one_note'],
      });
    });
  });
});
