export const getSyncErrorRecoveryHint = (
  message: string | undefined,
): string | undefined => {
  const normalizedMessage = (message ?? '').toLowerCase();

  if (normalizedMessage.includes('not installed')) {
    return 'Hint: run `yarn twenty apply` to register the app in this workspace, then retry.';
  }

  if (
    normalizedMessage.includes('already exists') ||
    normalizedMessage.includes('universalidentifier') ||
    /migration action .* failed/.test(normalizedMessage)
  ) {
    return 'Hint: a metadata conflict was detected. Preview the plan with `yarn twenty plan`; if it persists, run `yarn twenty app:uninstall -y` then sync again.';
  }

  return undefined;
};
