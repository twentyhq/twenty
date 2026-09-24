import { WorkspaceMigrationV2ExceptionCode } from 'twenty-shared/metadata';

export const getSyncErrorRecoveryHint = ({
  message,
  subCode,
}: {
  message: string | undefined;
  subCode?: string;
}): string | undefined => {
  if (
    subCode ===
    WorkspaceMigrationV2ExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS
  ) {
    return 'Hint: a previous data model change is still being applied in the background. Wait for it to finish, then sync again.';
  }

  const normalizedMessage = (message ?? '').toLowerCase();

  if (normalizedMessage.includes('not installed')) {
    return 'Hint: run `yarn twenty dev --once` to register the app in this workspace, then retry.';
  }

  if (
    normalizedMessage.includes('already exists') ||
    normalizedMessage.includes('universalidentifier') ||
    /migration action .* failed/.test(normalizedMessage)
  ) {
    return 'Hint: a metadata conflict was detected. Preview the plan with `yarn twenty dev --once --dry-run`; if it persists, run `yarn twenty app:uninstall -y` then sync again.';
  }

  return undefined;
};
