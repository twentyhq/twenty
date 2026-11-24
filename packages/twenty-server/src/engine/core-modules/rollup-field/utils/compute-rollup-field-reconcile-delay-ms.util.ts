import { ROLLUP_FIELD_RECONCILE_SPREAD_MS } from 'src/engine/core-modules/rollup-field/constants/rollup-field-reconcile-spread-ms.constant';

// Stable per workspace, so every workspace runs at the same hour each night but not all at once
export const computeRollupFieldReconcileDelayMs = (
  workspaceId: string,
): number => {
  let hash = 0;

  for (const character of workspaceId) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }

  return Math.abs(hash) % ROLLUP_FIELD_RECONCILE_SPREAD_MS;
};
