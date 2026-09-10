import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';

const GENERATE_APPLICATION_TOKEN_FOR_WORKSPACE_MEMBER_MUTATION = `mutation GenerateApplicationTokenForWorkspaceMember($workspaceMemberId: UUID!) {
  generateApplicationTokenForWorkspaceMember(workspaceMemberId: $workspaceMemberId) {
    token
  }
}`;

type WorkspaceMemberTokenResponse = {
  data?: {
    generateApplicationTokenForWorkspaceMember?: { token?: string };
  };
  errors?: { message?: string }[];
};

// Reads made through this client are bound to the member's own permissions
// intersected with the app's, so a record the member cannot open in Twenty
// does not come back. The pinned SDK cannot yet take
// `runAs: { workspaceMemberId }`, so the exchange it performs is done here.
export const createWorkspaceMemberCoreApiClient = async ({
  workspaceMemberId,
}: {
  workspaceMemberId: string;
}): Promise<CoreApiClient | undefined> => {
  let response: WorkspaceMemberTokenResponse | undefined;

  try {
    response = await new RestApiClient({
      runAs: 'application',
    }).post<WorkspaceMemberTokenResponse>('/metadata', {
      query: GENERATE_APPLICATION_TOKEN_FOR_WORKSPACE_MEMBER_MUTATION,
      variables: { workspaceMemberId },
    });
  } catch (error) {
    console.warn(
      `[slack] could not act as workspace member ${workspaceMemberId}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }

  const token =
    response?.data?.generateApplicationTokenForWorkspaceMember?.token;

  if (!isNonEmptyString(token)) {
    console.warn(
      `[slack] could not act as workspace member ${workspaceMemberId}: ${response?.errors?.[0]?.message ?? 'no token returned'}`,
    );

    return undefined;
  }

  return new CoreApiClient({ headers: { Authorization: `Bearer ${token}` } });
};
