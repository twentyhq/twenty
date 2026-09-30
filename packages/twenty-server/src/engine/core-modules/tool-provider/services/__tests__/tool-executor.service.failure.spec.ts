import { ToolCategory } from 'twenty-shared/ai';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

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

const context = {
  workspaceId: 'workspace',
  roleId: 'role',
  authContext: {
    type: 'user',
    workspace: { id: 'workspace' },
    userWorkspaceId: 'user-workspace',
  },
} as ToolProviderContext;

const buildService = (toolError: Error) => {
  const exceptionHandlerService = { captureExceptions: jest.fn() };
  const service = new ToolExecutorService(
    [],
    { execute: jest.fn().mockRejectedValue(toolError) } as never,
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
    exceptionHandlerService as never,
  );

  return { service, exceptionHandlerService };
};

describe('Tool execution failures', () => {
  it('reports a crash to Sentry and returns it to the caller as a failed result', async () => {
    const crash = new TypeError('records is not iterable');
    const { service, exceptionHandlerService } = buildService(crash);

    await expect(service.dispatch(descriptor, {}, context)).resolves.toEqual({
      success: false,
      message: 'Failed to execute find_people',
      error: 'records is not iterable',
    });
    expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledWith(
      [crash],
      {
        workspace: { id: 'workspace' },
        additionalData: { toolName: 'find_people' },
      },
    );
  });

  it('returns validation refusals with their details without reporting them', async () => {
    const { service, exceptionHandlerService } = buildService(
      new WorkspaceMigrationBuilderException({
        report: {
          view: [
            {
              errors: [{ code: 'INVALID_NAME', message: 'Name is required' }],
              flatEntityMinimalInformation: { name: 'All people' },
            },
          ],
        },
      } as never),
    );

    await expect(service.dispatch(descriptor, {}, context)).resolves.toEqual({
      success: false,
      message: 'Failed to execute find_people',
      error: 'Validation errors:\n[view] Name is required (All people)',
    });
    expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
  });
});
