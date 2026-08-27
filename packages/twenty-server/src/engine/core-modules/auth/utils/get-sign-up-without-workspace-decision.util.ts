export type SignUpWithoutWorkspaceDecision =
  | 'allowed'
  | 'refused'
  | 'requiresDestination';

// Tri-state rather than a boolean so callers only pay for the destination
// lookup on instances that restrict workspace creation.
export const getSignUpWithoutWorkspaceDecision = ({
  isMultiWorkspaceEnabled,
  isWorkspaceCreationLimitedToServerAdmins,
  workspaceCount,
}: {
  isMultiWorkspaceEnabled: boolean;
  isWorkspaceCreationLimitedToServerAdmins: boolean;
  workspaceCount: number;
}): SignUpWithoutWorkspaceDecision => {
  if (workspaceCount === 0) {
    return 'allowed';
  }

  if (!isMultiWorkspaceEnabled) {
    return 'refused';
  }

  if (!isWorkspaceCreationLimitedToServerAdmins) {
    return 'allowed';
  }

  return 'requiresDestination';
};
