import { AvailableWorkspaces, AvailableWorkspace } from '~/generated/graphql';

export const countAvailableWorkspaces = ({
  availableWorkspacesForSignIn,
  availableWorkspacesForSignUp,
}: AvailableWorkspaces): number => {
  return (
    availableWorkspacesForSignIn.length + availableWorkspacesForSignUp.length
  );
};

export const getFirstAvailableWorkspaces = ({
  availableWorkspacesForSignIn,
  availableWorkspacesForSignUp,
}: AvailableWorkspaces): AvailableWorkspace => {
  return availableWorkspacesForSignIn[0] ?? availableWorkspacesForSignUp[0];
};
