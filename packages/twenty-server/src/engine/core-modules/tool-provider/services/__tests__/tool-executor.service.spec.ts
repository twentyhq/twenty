import { ToolCategory } from 'twenty-shared/ai';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type DefinedToolRegistryService } from 'src/engine/core-modules/tool-provider/services/defined-tool-registry.service';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

const memberContext: ToolProviderContext = {
  workspaceId: 'workspace-id',
  rolePermissionConfig: {
    intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
  },
};

const scopedContext: ToolProviderContext = {
  ...memberContext,
  rolePermissionConfig: {
    intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
    scope: { objectsPermissions: {}, permissionFlags: {} },
  },
};

const workflowToolDescriptor: ToolIndexEntry = {
  name: 'list_workflows',
  label: 'List Workflows',
  description: 'List workflows.',
  category: ToolCategory.WORKFLOW,
  executionRef: { kind: 'static', toolId: 'list_workflows' },
};

const logicFunctionDescriptor: ToolIndexEntry = {
  name: 'sync_invoices',
  label: 'Sync Invoices',
  description: 'Sync invoices.',
  category: ToolCategory.LOGIC_FUNCTION,
  executionRef: { kind: 'logic_function', logicFunctionId: 'function-id' },
};

const buildToolExecutorService = ({
  canRunUnderScope = false,
}: { canRunUnderScope?: boolean } = {}) => {
  const executeStaticTool = jest
    .fn()
    .mockResolvedValue({ success: true, message: 'Listed' });
  const executeLogicFunction = jest
    .fn()
    .mockResolvedValue({ data: { synced: true } });
  const workflowToolProvider: ToolProvider = {
    category: ToolCategory.WORKFLOW,
    canRunUnderScope,
    isAvailable: jest.fn().mockResolvedValue(true),
    generateDescriptors: jest.fn().mockResolvedValue([]),
    executeStaticTool,
  };
  const unusedDependency = {} as never;

  const toolExecutorService = new ToolExecutorService(
    [workflowToolProvider],
    {
      findDefinedTool: () => undefined,
    } as unknown as DefinedToolRegistryService,
    unusedDependency,
    unusedDependency,
    unusedDependency,
    unusedDependency,
    unusedDependency,
    unusedDependency,
    unusedDependency,
    unusedDependency,
    unusedDependency,
    unusedDependency,
    { execute: executeLogicFunction } as never,
    unusedDependency,
    unusedDependency,
    unusedDependency,
    { captureExceptions: jest.fn() } as never,
  );

  return { toolExecutorService, executeStaticTool, executeLogicFunction };
};

describe('ToolExecutorService', () => {
  it('should dispatch to a provider that cannot run under a scope for a caller without one', async () => {
    const { toolExecutorService, executeStaticTool } =
      buildToolExecutorService();

    expect(
      await toolExecutorService.dispatch(
        workflowToolDescriptor,
        {},
        memberContext,
      ),
    ).toMatchObject({ success: true });
    expect(executeStaticTool).toHaveBeenCalled();
  });

  it('should refuse a scoped caller a provider that cannot run under a scope', async () => {
    const { toolExecutorService, executeStaticTool } =
      buildToolExecutorService();

    expect(
      await toolExecutorService.dispatch(
        workflowToolDescriptor,
        {},
        scopedContext,
      ),
    ).toMatchObject({
      success: false,
      message: 'Tool "list_workflows" is not available',
    });
    expect(executeStaticTool).not.toHaveBeenCalled();
  });

  it('should dispatch a scoped caller to a provider that can run under a scope', async () => {
    const { toolExecutorService, executeStaticTool } = buildToolExecutorService(
      { canRunUnderScope: true },
    );

    expect(
      await toolExecutorService.dispatch(
        workflowToolDescriptor,
        {},
        scopedContext,
      ),
    ).toMatchObject({ success: true });
    expect(executeStaticTool).toHaveBeenCalled();
  });

  it('should refuse a scoped caller a logic function', async () => {
    const { toolExecutorService, executeLogicFunction } =
      buildToolExecutorService();

    expect(
      await toolExecutorService.dispatch(
        logicFunctionDescriptor,
        {},
        scopedContext,
      ),
    ).toMatchObject({
      success: false,
      message: 'Tool "sync_invoices" is not available',
    });
    expect(executeLogicFunction).not.toHaveBeenCalled();
  });
});
