import { isDefined } from 'twenty-shared/utils';

type UserWorkspaceActivity = {
  deletedAt?: Date | null;
  user?: {
    disabled?: boolean | null;
    deletedAt?: Date | null;
  } | null;
};

export const isActiveUserWorkspace = <
  TUserWorkspace extends UserWorkspaceActivity,
>(
  userWorkspace: TUserWorkspace | null | undefined,
): userWorkspace is TUserWorkspace & {
  user: NonNullable<TUserWorkspace['user']>;
} =>
  isDefined(userWorkspace) &&
  !isDefined(userWorkspace.deletedAt) &&
  isDefined(userWorkspace.user) &&
  !userWorkspace.user.disabled &&
  !isDefined(userWorkspace.user.deletedAt);
