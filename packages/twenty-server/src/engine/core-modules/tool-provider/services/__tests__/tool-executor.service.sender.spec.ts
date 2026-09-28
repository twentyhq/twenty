import { ToolCategory } from 'twenty-shared/ai';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

const descriptor = {
  name: 'find_people',
  label: 'Find people',
  description: '',
  category: ToolCategory.DATABASE_CRUD,
  executionRef: {
    kind: 'database_crud',
    operation: 'find_many',
    objectNameSingular: 'person',
  },
} as ToolIndexEntry;

const build = () => {
  const findRecords = {
    execute: jest.fn().mockResolvedValue({ success: true }),
  };
  const service = new ToolExecutorService(
    [],
    findRecords as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
  const current = {
    workspaceId: 'workspace',
    roleId: 'current-role',
    rolePermissionConfig: { intersectionOf: ['current-role', 'app-role'] },
    authContext: {
      type: 'user',
      workspace: { id: 'workspace' },
      userWorkspaceId: 'sender',
    },
  } as ToolProviderContext;
  const resolveExecutionContext = jest.fn().mockResolvedValue(current);
  const context = {
    ...current,
    roleId: 'old-role',
    rolePermissionConfig: { unionOf: ['old-role'] },
    resolveExecutionContext,
  };
  return { service, findRecords, context, current, resolveExecutionContext };
};

describe('Tool execution sender permissions', () => {
  it('uses the sender’s current role and application intersection for an already loaded tool', async () => {
    const { service, findRecords, context, current } = build();
    await service.dispatch(descriptor, {}, context);
    expect(findRecords.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        authContext: current.authContext,
        rolePermissionConfig: current.rolePermissionConfig,
      }),
    );
  });

  it('does not invoke the tool after the sender loses access during a turn', async () => {
    const { service, findRecords, context, resolveExecutionContext } = build();
    await service.dispatch(descriptor, {}, context);
    resolveExecutionContext.mockRejectedValue(
      new Error('Sender access revoked'),
    );
    await expect(service.dispatch(descriptor, {}, context)).rejects.toThrow(
      'Sender access revoked',
    );
    expect(findRecords.execute).toHaveBeenCalledTimes(1);
  });
});
