import { generatePath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type AvailableWorkspace,
  type AvailableWorkspaces,
} from '~/generated/graphql';

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

const getAvailableWorkspacePathname = (
  availableWorkspace: AvailableWorkspace,
) => {
  if (isDefined(availableWorkspace.loginToken)) {
    return AppPath.Verify;
  }

  if (
    isDefined(availableWorkspace.personalInviteToken) &&
    isDefined(availableWorkspace.inviteHash)
  ) {
    return generatePath(AppPath.Invite, {
      workspaceInviteHash: availableWorkspace.inviteHash,
    });
  }

  return AppPath.SignInUp;
};

const getAvailableWorkspaceSearchParams = (
  availableWorkspace: AvailableWorkspace,
  defaultSearchParams: Record<string, string> = {},
) => {
  const searchParams: Record<string, string> = defaultSearchParams;

  if (isDefined(availableWorkspace.loginToken)) {
    searchParams.loginToken = availableWorkspace.loginToken;
    return searchParams;
  }

  if (isDefined(availableWorkspace.personalInviteToken)) {
    searchParams.inviteToken = availableWorkspace.personalInviteToken;
  }

  return searchParams;
};

export const getAvailableWorkspacePathAndSearchParams = (
  availableWorkspace: AvailableWorkspace,
  defaultSearchParams: Record<string, string> = {},
): { pathname: string; searchParams: Record<string, string> } => {
  return {
    pathname: getAvailableWorkspacePathname(availableWorkspace),
    searchParams: getAvailableWorkspaceSearchParams(
      availableWorkspace,
      defaultSearchParams,
    ),
  };
};
