import { buildToolExecutionFailure } from 'src/engine/core-modules/tool-provider/utils/build-tool-execution-failure.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

describe('buildToolExecutionFailure', () => {
  it('should report a crash and return its message', () => {
    expect(
      buildToolExecutionFailure(
        new TypeError("Cannot read properties of undefined (reading 'id')"),
        'find_people',
      ),
    ).toEqual({
      output: {
        success: false,
        message: 'Failed to execute find_people',
        error: "Cannot read properties of undefined (reading 'id')",
      },
      shouldCapture: true,
    });
  });

  it('should return validation errors without reporting them', () => {
    const error = new WorkspaceMigrationBuilderException({
      status: 'fail',
      report: {
        view: [
          {
            errors: [{ code: 'INVALID_NAME', message: 'Name is required' }],
            flatEntityMinimalInformation: { name: 'All people' },
          },
        ],
      },
    } as never);

    expect(buildToolExecutionFailure(error, 'create_view')).toEqual({
      output: {
        success: false,
        message: 'Failed to execute create_view',
        error: 'Validation errors:\n[view] Name is required (All people)',
      },
      shouldCapture: false,
    });
  });

  it('should report a thrown value that is not an Error', () => {
    expect(buildToolExecutionFailure('boom', 'find_people')).toEqual({
      output: {
        success: false,
        message: 'Failed to execute find_people',
        error: 'boom',
      },
      shouldCapture: true,
    });
  });
});
