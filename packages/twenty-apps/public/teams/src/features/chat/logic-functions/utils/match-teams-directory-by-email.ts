import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { findWorkspaceMemberIdsByEmails } from 'src/features/chat/logic-functions/data/find-workspace-member-ids-by-emails';
import { listLinkedTeamsUserAadObjectIdsOrThrow } from 'src/features/chat/logic-functions/data/list-linked-teams-user-aad-object-ids';
import { type TeamsDirectoryMatchRunOutcome } from 'src/features/chat/logic-functions/types/teams-directory-match-run-outcome.type';
import { type TeamsDirectoryMatchSummary } from 'src/features/chat/logic-functions/types/teams-directory-match.type';
import { collectGraphUsers } from 'src/features/chat/logic-functions/utils/collect-graph-users';
import { getTeamsDirectoryUserEmail } from 'src/features/chat/logic-functions/utils/get-teams-directory-user-email';
import { linkTeamsDirectoryCandidates } from 'src/features/chat/logic-functions/utils/link-teams-directory-candidates';
import { planTeamsDirectoryMatch } from 'src/features/chat/logic-functions/utils/plan-teams-directory-match';
import { saveTeamsDirectoryMatchRunOutcome } from 'src/features/chat/logic-functions/utils/save-teams-directory-match-run-outcome';
import { toErrorMessage } from 'src/utils/to-error-message';

const DIRECTORY_GRAPH_URL =
  'users?$select=id,displayName,mail,userPrincipalName&$top=999';
const DIRECTORY_MAX_PAGES = 10;

const INTERRUPTED_RUN_OUTCOME: TeamsDirectoryMatchRunOutcome = {
  isSuccessful: false,
  errorMessage: 'The directory match was interrupted before it finished.',
};

const runTeamsDirectoryMatch = async ({
  accessToken,
  teamsTenantId,
}: {
  accessToken: string;
  teamsTenantId: string;
}): Promise<TeamsDirectoryMatchSummary> => {
  const client = new CoreApiClient({ runAs: 'application' });

  const [linkedAadObjectIds, directory] = await Promise.all([
    listLinkedTeamsUserAadObjectIdsOrThrow({ client, teamsTenantId }),
    collectGraphUsers({
      accessToken,
      url: DIRECTORY_GRAPH_URL,
      maxPages: DIRECTORY_MAX_PAGES,
    }),
  ]);

  const { workspaceMemberIdByEmail, ambiguousEmailCount } =
    await findWorkspaceMemberIdsByEmails({
      client,
      emails: directory.users
        .map(getTeamsDirectoryUserEmail)
        .filter(isNonEmptyString),
    });

  const { candidates, alreadyLinkedCount, unmatchedCount } =
    planTeamsDirectoryMatch({
      users: directory.users,
      workspaceMemberIdByEmail,
      linkedAadObjectIds,
    });

  const { linkedCount, failedCount } = await linkTeamsDirectoryCandidates({
    client,
    candidates,
    teamsTenantId,
  });

  return {
    linkedCount,
    alreadyLinkedCount,
    unmatchedCount,
    ambiguousEmailCount,
    failedCount,
    isDirectoryTruncated: directory.isTruncated,
  };
};

export const matchTeamsDirectoryByEmail = async ({
  accessToken,
  teamsTenantId,
}: {
  accessToken: string;
  teamsTenantId: string;
}): Promise<TeamsDirectoryMatchSummary> => {
  await saveTeamsDirectoryMatchRunOutcome(INTERRUPTED_RUN_OUTCOME);

  try {
    const summary = await runTeamsDirectoryMatch({
      accessToken,
      teamsTenantId,
    });

    await saveTeamsDirectoryMatchRunOutcome({
      isSuccessful: summary.failedCount === 0,
    });

    return summary;
  } catch (error) {
    await saveTeamsDirectoryMatchRunOutcome({
      isSuccessful: false,
      errorMessage: toErrorMessage(error),
    });

    throw error;
  }
};
