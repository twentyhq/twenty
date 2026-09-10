import { isNonEmptyString } from './is-non-empty-string.util';

// Mirrors the inline copy in generate/twenty-client-template.ts: the template
// is injected into generated clients that cannot import from this package.
export const GENERATE_APPLICATION_TOKEN_FOR_WORKSPACE_MEMBER_MUTATION = `mutation GenerateApplicationTokenForWorkspaceMember($workspaceMemberId: UUID!) {
  generateApplicationTokenForWorkspaceMember(workspaceMemberId: $workspaceMemberId) {
    applicationAccessToken {
      token
    }
  }
}`;

type WorkspaceMemberTokenResponsePayload = {
  data?: {
    generateApplicationTokenForWorkspaceMember?: {
      applicationAccessToken?: { token?: string };
    };
  };
  errors?: { message?: string }[];
};

export const requestWorkspaceMemberAccessToken = async ({
  fetchImplementation,
  apiUrl,
  applicationAccessToken,
  workspaceMemberId,
}: {
  fetchImplementation: typeof globalThis.fetch;
  apiUrl: string;
  applicationAccessToken: string;
  workspaceMemberId: string;
}): Promise<string> => {
  const response = await fetchImplementation.call(
    globalThis,
    `${apiUrl.replace(/\/+$/, '')}/metadata`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${applicationAccessToken}`,
      },
      body: JSON.stringify({
        query: GENERATE_APPLICATION_TOKEN_FOR_WORKSPACE_MEMBER_MUTATION,
        variables: { workspaceMemberId },
      }),
    },
  );

  const rawBody = await response.text();
  let payload: WorkspaceMemberTokenResponsePayload | null = null;

  try {
    payload = JSON.parse(rawBody) as WorkspaceMemberTokenResponsePayload;
  } catch {
    payload = null;
  }

  const token =
    payload?.data?.generateApplicationTokenForWorkspaceMember
      ?.applicationAccessToken?.token;

  if (isNonEmptyString(token)) {
    return token;
  }

  const reason =
    payload?.errors?.[0]?.message ??
    (response.ok ? rawBody : `${response.status} ${response.statusText}`);

  throw new Error(
    `Could not act as workspace member ${workspaceMemberId}: ${reason}`,
  );
};
