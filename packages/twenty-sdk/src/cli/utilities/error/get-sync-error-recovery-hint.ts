export const getSyncErrorRecoveryHint = (
  message: string | undefined,
): string | undefined => {
  const normalizedMessage = (message ?? '').toLowerCase();

  if (normalizedMessage.includes('not installed')) {
    return 'Hint: run `yarn twenty dev --once` to register the app in this workspace, then retry.';
  }

  if (
    normalizedMessage.includes('relation field target metadata not found') ||
    normalizedMessage.includes('relation target field')
  ) {
    return 'Hint: relations are bidirectional. Declare the reverse relation field (ONE_TO_MANY on the target object, including standard objects) and cross-reference both universal identifiers. See developers/extend/apps/data/relations.';
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
