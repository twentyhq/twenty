import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const RUN_AS_WORKSPACE_MEMBER_TOKEN_PATH =
  '/app/tokens/run-as-workspace-member';
const RUN_AS_WORKSPACE_MEMBER_TOKEN_TIMEOUT_MS = 5_000;

type RunAsWorkspaceMemberTokenResponse = { token?: string };

// Reads with this client resolve to the intersection of the app role and the
// member's own role. Returns undefined rather than falling back to the app
// role, so a preview the member may not see is skipped instead of shown.
export const createWorkspaceMemberCoreClient = async (
  workspaceMemberId: string,
): Promise<CoreApiClient | undefined> => {
  try {
    const response = await new RestApiClient({
      runAs: 'application',
    }).post<RunAsWorkspaceMemberTokenResponse>(
      RUN_AS_WORKSPACE_MEMBER_TOKEN_PATH,
      { workspaceMemberId },
      {
        signal: AbortSignal.timeout(RUN_AS_WORKSPACE_MEMBER_TOKEN_TIMEOUT_MS),
      },
    );

    if (!isNonEmptyString(response?.token)) {
      return undefined;
    }

    return new CoreApiClient({
      headers: { Authorization: `Bearer ${response.token}` },
    });
  } catch (error) {
    console.warn(
      `[slack] could not read as workspace member ${workspaceMemberId}: ${toErrorMessage(error)}`,
    );

    return undefined;
  }
};
