import { type AvailableWorkspaces } from '~/generated-metadata/graphql';

export const countAvailableWorkspacesExcludingCurrent = (
  {
    availableWorkspacesForSignIn,
    availableWorkspacesForSignUp,
  }: AvailableWorkspaces,
  currentWorkspaceId: string | undefined,
): number =>
  [...availableWorkspacesForSignIn, ...availableWorkspacesForSignUp].filter(
    ({ id }) => id !== currentWorkspaceId,
  ).length;
