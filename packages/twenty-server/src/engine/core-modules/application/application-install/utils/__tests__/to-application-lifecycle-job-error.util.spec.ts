import { toApplicationLifecycleJobError } from 'src/engine/core-modules/application/application-install/utils/to-application-lifecycle-job-error.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const MISSING_PERMISSION_FLAG_MESSAGE =
  'Standard permission flag CREATE_CALENDAR_EVENT_TOOL (5b8c104e-24d3-4e89-986b-1d9208df6cf4) not found in this workspace. Run the workspace upgrade to create it.';

describe('toApplicationLifecycleJobError', () => {
  it('replaces the generic sync message with the validation errors', () => {
    const report = {
      rolePermissionFlag: [
        {
          type: 'create',
          metadataName: 'rolePermissionFlag',
          errors: [
            {
              code: 'INVALID_SETTING',
              message: MISSING_PERMISSION_FLAG_MESSAGE,
            },
          ],
          flatEntityMinimalInformation: {},
        },
      ],
    };

    const jobError = toApplicationLifecycleJobError(
      new WorkspaceMigrationBuilderException(
        { status: 'fail', report } as never,
        'Validation errors occurred while syncing application manifest metadata',
      ),
    );

    expect(jobError).toBeInstanceOf(WorkspaceMigrationBuilderException);
    expect((jobError as WorkspaceMigrationBuilderException).message).toBe(
      `Validation errors:\n[rolePermissionFlag] ${MISSING_PERMISSION_FLAG_MESSAGE}`,
    );
    expect(
      (jobError as WorkspaceMigrationBuilderException)
        .failedWorkspaceMigrationBuildResult.report,
    ).toBe(report);
  });

  it('leaves any other error untouched', () => {
    const error = new Error('Package resolution failed');

    expect(toApplicationLifecycleJobError(error)).toBe(error);
  });
});
