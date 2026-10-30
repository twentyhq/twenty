import { ToolCategory } from 'twenty-shared/ai';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

const crudTool = (operation: string, name = `${operation}_opportunity`) =>
  ({
    name,
    label: name,
    description: '',
    category: ToolCategory.DATABASE_CRUD,
    executionRef: {
      kind: 'database_crud',
      operation,
      objectNameSingular: 'opportunity',
    },
  }) as ToolIndexEntry;

const actionTool = (name: string) =>
  ({
    name,
    label: name,
    description: '',
    category: ToolCategory.ACTION,
    executionRef: { kind: 'static', toolId: name },
  }) as ToolIndexEntry;

const build = () => {
  const findRecords = {
    execute: jest.fn().mockResolvedValue({ success: true }),
  };
  const updateRecord = {
    execute: jest.fn().mockResolvedValue({ success: true }),
  };
  const deleteRecord = {
    execute: jest.fn().mockResolvedValue({ success: true }),
  };
  const service = new ToolExecutorService(
    [],
    findRecords as never,
    {} as never,
    {} as never,
    {} as never,
    updateRecord as never,
    {} as never,
    {} as never,
    deleteRecord as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
  const proposeAction = jest.fn().mockResolvedValue({
    success: true,
    message: 'Prepared for review',
    result: {
      interaction: {
        schemaVersion: 1,
        kind: 'action-review',
        actionRequestId: 'action-id',
      },
    },
  });
  const context = {
    workspaceId: 'workspace',
    roleId: 'role',
    rolePermissionConfig: { unionOf: ['role'] },
    authContext: {
      type: 'user',
      workspace: { id: 'workspace' },
      userWorkspaceId: 'sender',
    },
    aiActionPolicy: { proposeAction },
  } as unknown as ToolProviderContext;

  return {
    service,
    findRecords,
    updateRecord,
    deleteRecord,
    proposeAction,
    context,
  };
};

describe('Tool execution under the reviewed actions policy', () => {
  it('turns a record update into a proposal instead of writing it', async () => {
    const { service, updateRecord, proposeAction, context } = build();

    const output = await service.dispatch(
      crudTool('update_one'),
      { id: 'record-id', stage: 'WON' },
      context,
      { toolCallId: 'call-1' },
    );

    expect(updateRecord.execute).not.toHaveBeenCalled();
    expect(proposeAction).toHaveBeenCalledWith({
      kind: 'update_record_fields',
      objectNameSingular: 'opportunity',
      toolName: 'update_one_opportunity',
      toolCallId: 'call-1',
      arguments: { id: 'record-id', stage: 'WON' },
    });
    expect(output.result).toEqual({
      interaction: {
        schemaVersion: 1,
        kind: 'action-review',
        actionRequestId: 'action-id',
      },
    });
  });

  it('turns send_email into a proposal', async () => {
    const { service, proposeAction, context } = build();

    await service.dispatch(
      actionTool('send_email'),
      { subject: 'Hi' },
      context,
    );

    expect(proposeAction).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'send_email', toolName: 'send_email' }),
    );
  });

  it('refuses deletes, bulk writes, mailbox drafts and code without running them', async () => {
    const { service, deleteRecord, proposeAction, context } = build();

    for (const descriptor of [
      crudTool('delete_one'),
      crudTool('update_many'),
      actionTool('draft_email'),
      actionTool('http_request'),
      actionTool('code_interpreter'),
      {
        name: 'run_app_function',
        label: 'run',
        description: '',
        category: ToolCategory.LOGIC_FUNCTION,
        executionRef: { kind: 'logic_function', logicFunctionId: 'id' },
      } as ToolIndexEntry,
    ]) {
      const output = await service.dispatch(descriptor, {}, context);

      expect(output.success).toBe(false);
    }

    expect(deleteRecord.execute).not.toHaveBeenCalled();
    expect(proposeAction).not.toHaveBeenCalled();
  });

  it('lets reads through unchanged', async () => {
    const { service, findRecords, proposeAction, context } = build();

    await service.dispatch(
      crudTool('find_many', 'find_opportunities'),
      {},
      context,
    );

    expect(findRecords.execute).toHaveBeenCalled();
    expect(proposeAction).not.toHaveBeenCalled();
  });

  it('applies no policy to contexts built without it', async () => {
    const { service, updateRecord, proposeAction, context } = build();
    const { aiActionPolicy: _aiActionPolicy, ...contextWithoutPolicy } =
      context;

    updateRecord.execute.mockResolvedValue({ success: true });

    await service
      .dispatch(
        crudTool('update_one'),
        { id: 'record-id' },
        contextWithoutPolicy as ToolProviderContext,
      )
      .catch(() => undefined);

    expect(proposeAction).not.toHaveBeenCalled();
  });
});
