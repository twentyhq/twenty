import { WorkspaceMigrationRunnerExceptionCode } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

export const USER_FACING_WORKSPACE_MIGRATION_RUNNER_EXCEPTION_CODES: (keyof typeof WorkspaceMigrationRunnerExceptionCode)[] =
  [
    WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
    WorkspaceMigrationRunnerExceptionCode.DDL_LOCKED,
  ];
