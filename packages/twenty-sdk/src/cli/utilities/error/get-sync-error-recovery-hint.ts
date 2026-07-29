export const getSyncErrorRecoveryHint = (
  message: string | undefined,
): string | undefined => {
  const normalizedMessage = (message ?? '').toLowerCase();

  if (normalizedMessage.includes('not installed')) {
    return 'Hint: run `yarn twenty dev --once` to register the app in this workspace, then retry.';
  }

  if (
    normalizedMessage.includes('already exists') ||
    normalizedMessage.includes('universalidentifier') ||
    /migration action .* failed/.test(normalizedMessage)
  ) {
    // View-structure metadata (viewField, viewFieldGroup, viewFilter, viewSort)
    // is silently adopted from the workspace-custom application when the
    // manifest declares the same universalIdentifier. Other metadata
    // (objectMetadata, fieldMetadata, view, pageLayout*, ...) does NOT
    // auto-adopt — a real collision here needs a manual decision.
    const isViewStructureConflict =
      normalizedMessage.includes('viewfield') ||
      normalizedMessage.includes('view field') ||
      normalizedMessage.includes('viewfilter') ||
      normalizedMessage.includes('view filter') ||
      normalizedMessage.includes('viewsort') ||
      normalizedMessage.includes('view sort') ||
      normalizedMessage.includes('viewfieldgroup') ||
      normalizedMessage.includes('view field group');

    if (isViewStructureConflict) {
      return 'Hint: view-structure metadata (viewField, viewFieldGroup, viewFilter, viewSort) that the user added via the UI should be auto-adopted by `yarn twenty apply`. If this still fails, the existing entity targets a different view/field than the manifest — inspect it with `yarn twenty app:inspect <universalIdentifier>` (if available) and either align the manifest or remove the conflicting UI row.';
    }

    return 'Hint: a metadata conflict was detected. Preview the plan with `yarn twenty dev --once --dry-run`; if it persists, run `yarn twenty app:uninstall -y` then sync again. Only do this if the conflict targets app-owned entities you no longer need.';
  }

  return undefined;
};
