export type CoreWorkflowStatus = 'ACTIVE' | 'DRAFT' | 'DEACTIVATED';

export const computeCoreWorkflowStatus = ({
  hasActiveVersion,
  hasDraftVersion,
}: {
  hasActiveVersion: boolean;
  hasDraftVersion: boolean;
}): CoreWorkflowStatus => {
  if (hasActiveVersion) {
    return 'ACTIVE';
  }

  if (hasDraftVersion) {
    return 'DRAFT';
  }

  return 'DEACTIVATED';
};
