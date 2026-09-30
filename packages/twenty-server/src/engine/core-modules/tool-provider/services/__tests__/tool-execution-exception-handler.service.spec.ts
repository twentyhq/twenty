import { ToolExecutionExceptionHandlerService } from 'src/engine/core-modules/tool-provider/services/tool-execution-exception-handler.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const buildService = () => {
  const exceptionHandlerService = { captureExceptions: jest.fn() };

  return {
    service: new ToolExecutionExceptionHandlerService(
      exceptionHandlerService as never,
    ),
    exceptionHandlerService,
  };
};

describe('ToolExecutionExceptionHandlerService', () => {
  it('should report a crash to Sentry and return it as a failed tool result', () => {
    const { service, exceptionHandlerService } = buildService();
    const crash = new TypeError('records is not iterable');

    expect(
      service.handleToolExecutionException({
        error: crash,
        toolName: 'create_many_people',
        workspaceId: 'workspace',
      }),
    ).toEqual({
      success: false,
      message: 'Failed to execute create_many_people',
      error: 'records is not iterable',
    });
    expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledWith(
      [crash],
      {
        workspace: { id: 'workspace' },
        additionalData: { toolName: 'create_many_people' },
      },
    );
  });

  it('should return a validation refusal with its details without reporting it', () => {
    const { service, exceptionHandlerService } = buildService();

    expect(
      service.handleToolExecutionException({
        error: new WorkspaceMigrationBuilderException({
          report: {
            view: [
              {
                errors: [{ code: 'INVALID_NAME', message: 'Name is required' }],
                flatEntityMinimalInformation: { name: 'All people' },
              },
            ],
          },
        } as never),
        toolName: 'create_view',
        workspaceId: 'workspace',
      }),
    ).toEqual({
      success: false,
      message: 'Failed to execute create_view',
      error: 'Validation errors:\n[view] Name is required (All people)',
    });
    expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
  });
});
