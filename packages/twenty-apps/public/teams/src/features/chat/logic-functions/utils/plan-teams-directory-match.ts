import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type LinkableGraphUser } from 'src/features/chat/logic-functions/types/graph-user.type';
import {
  type TeamsDirectoryMatchCandidate,
  type TeamsDirectoryMatchPlan,
} from 'src/features/chat/logic-functions/types/teams-directory-match.type';
import { getTeamsDirectoryUserEmail } from 'src/features/chat/logic-functions/utils/get-teams-directory-user-email';

type PlannedDirectoryUser =
  | { status: 'alreadyLinked' }
  | { status: 'unmatched' }
  | { status: 'candidate'; candidate: TeamsDirectoryMatchCandidate };

const planDirectoryUser = ({
  user,
  workspaceMemberIdByEmail,
  linkedAadObjectIds,
}: {
  user: LinkableGraphUser;
  workspaceMemberIdByEmail: Map<string, string>;
  linkedAadObjectIds: Set<string>;
}): PlannedDirectoryUser => {
  if (linkedAadObjectIds.has(user.id)) {
    return { status: 'alreadyLinked' };
  }

  const email = getTeamsDirectoryUserEmail(user);
  const workspaceMemberId = isNonEmptyString(email)
    ? workspaceMemberIdByEmail.get(email.toLowerCase())
    : undefined;

  if (!isDefined(workspaceMemberId)) {
    return { status: 'unmatched' };
  }

  return {
    status: 'candidate',
    candidate: {
      teamsUserAadObjectId: user.id,
      workspaceMemberId,
      displayName: isNonEmptyString(user.displayName)
        ? user.displayName
        : undefined,
    },
  };
};

export const planTeamsDirectoryMatch = ({
  users,
  workspaceMemberIdByEmail,
  linkedAadObjectIds,
}: {
  users: LinkableGraphUser[];
  workspaceMemberIdByEmail: Map<string, string>;
  linkedAadObjectIds: Set<string>;
}): TeamsDirectoryMatchPlan => {
  const plannedUsers = users.map((user) =>
    planDirectoryUser({ user, workspaceMemberIdByEmail, linkedAadObjectIds }),
  );

  return {
    candidates: plannedUsers.flatMap((plannedUser) =>
      plannedUser.status === 'candidate' ? [plannedUser.candidate] : [],
    ),
    alreadyLinkedCount: plannedUsers.filter(
      (plannedUser) => plannedUser.status === 'alreadyLinked',
    ).length,
    unmatchedCount: plannedUsers.filter(
      (plannedUser) => plannedUser.status === 'unmatched',
    ).length,
  };
};
