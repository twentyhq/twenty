import {
  isWorkspaceProvisioned,
  type WorkspaceActivationStatus,
} from 'twenty-shared/workspace';

export type SignUpWithoutWorkspaceDecision =
  | 'allowed'
  | 'refused'
  | 'requiresDestination';

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

export const hasProvisionedSignUpDestination = (
  availableWorkspacesForSignUp: {
    workspace: { activationStatus: WorkspaceActivationStatus };
  }[],
): boolean =>
  availableWorkspacesForSignUp.some(({ workspace }) =>
    isWorkspaceProvisioned(workspace),
  );
