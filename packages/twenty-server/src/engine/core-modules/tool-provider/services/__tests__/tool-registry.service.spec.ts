import { Test } from '@nestjs/testing';

import { ToolCategory } from 'twenty-shared/ai';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { DefinedToolRegistryService } from 'src/engine/core-modules/tool-provider/services/defined-tool-registry.service';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { ToolOutputSpillService } from 'src/engine/core-modules/tool/services/tool-output-spill.service';

const workspaceId = 'workspace-id';

const buildToolRegistryService = async () => {
  const generateDescriptors = jest.fn().mockResolvedValue([]);
  const definedToolRegistryService = {
    getAvailableDescriptors: jest.fn().mockResolvedValue([]),
    findDefinedTool: jest.fn(),
  };

  const module = await Test.createTestingModule({
    providers: [
      ToolRegistryService,
      {
        provide: TOOL_PROVIDERS,
        useValue: [
          {
            category: ToolCategory.DATABASE_CRUD,
            isAvailable: jest.fn().mockResolvedValue(true),
            generateDescriptors,
            executeStaticTool: jest.fn(),
          },
        ],
      },
      {
        provide: DefinedToolRegistryService,
        useValue: definedToolRegistryService,
      },
      { provide: ToolExecutorService, useValue: {} },
      { provide: ToolOutputSpillService, useValue: {} },
      { provide: ExceptionHandlerService, useValue: {} },
    ],
  }).compile();

  return {
    toolRegistryService: module.get(ToolRegistryService),
    generateDescriptors,
  };
};

describe('ToolRegistryService', () => {
  describe('getCatalog', () => {
    it('should keep the explicit object grants when the context resolves to a fresh one', async () => {
      const { toolRegistryService, generateDescriptors } =
        await buildToolRegistryService();
      const resolvedContext: ToolProviderContext = {
        workspaceId,
      };

      await toolRegistryService.getCatalog({
        workspaceId,
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
});
