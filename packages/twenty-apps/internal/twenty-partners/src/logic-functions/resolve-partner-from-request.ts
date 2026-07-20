import { CoreApiClient } from 'twenty-client-sdk/core';

// Self-service routes run with the app-privileged token in production. Under the vitest
// harness TWENTY_APP_ACCESS_TOKEN is a crafted identity-only token (decoded for userId but
// not a valid API credential), so fall back to the workspace API key for the actual
// queries/mutations. Production is unaffected — VITEST is unset and no API key is injected.
export const buildAppClient = (): CoreApiClient => {
  const apiKey = process.env.TWENTY_API_KEY;
  if (process.env.VITEST && apiKey) {
    return new CoreApiClient({ headers: { Authorization: `Bearer ${apiKey}` } });
  }
  return new CoreApiClient();
};

export const decodeJwtClaims = (
  token: string,
): { userId?: string; userWorkspaceId?: string } => {
  const part = token.split('.')[1];
  if (!part) return {};
  try {
    const json = Buffer.from(
      part.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('utf8');
    const parsed = JSON.parse(json);
    // A JWT payload can decode to a non-object (null, number, string); guard so callers
    // reading claims.userId reject cleanly instead of throwing on a valid-but-malformed token.
    if (parsed === null || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
};

export const resolvePartnerByUserId = async (
  client: CoreApiClient,
  userId: string,
): Promise<{ partnerId: string; workspaceMemberId: string } | null> => {
  const members = await client.query({
    workspaceMembers: {
      __args: { filter: { userId: { eq: userId } }, first: 1 },
      edges: { node: { id: true } },
    },
  });
  const workspaceMemberId = members.workspaceMembers?.edges?.[0]?.node?.id;
  if (!workspaceMemberId) return null;

  const partners = await client.query({
    partners: {
      __args: { filter: { partnerUserId: { eq: workspaceMemberId } }, first: 1 },
      edges: { node: { id: true } },
    },
  });
  const partnerId = partners.partners?.edges?.[0]?.node?.id;
  if (!partnerId) return null;

  return { partnerId, workspaceMemberId };
};

export type ResolvedPartner =
  | { partnerId: string; workspaceMemberId: string }
  | { error: 'UNAUTHENTICATED' | 'NO_PARTNER' };

export const resolvePartnerFromRequest = async (event: {
  userWorkspaceId?: string | null;
}): Promise<ResolvedPartner> => {
  const userWorkspaceId = event.userWorkspaceId ?? null;
  if (!userWorkspaceId) return { error: 'UNAUTHENTICATED' };

  // Decode, do not verify — this env token was freshly minted server-side for this call.
  const claims = decodeJwtClaims(process.env.TWENTY_APP_ACCESS_TOKEN ?? '');
  if (!claims.userId || claims.userWorkspaceId !== userWorkspaceId) {
    return { error: 'UNAUTHENTICATED' };
  }

  const resolved = await resolvePartnerByUserId(buildAppClient(), claims.userId);
  return resolved ?? { error: 'NO_PARTNER' };
};

export type PartnerRouteError = { ok: false; reason: string };

export const errorResponse = (reason: string): PartnerRouteError => ({
  ok: false,
  reason,
});

// Log the real cause server-side but never surface raw SDK/DB text to partner users.
export const failureResponse = (logTag: string, err: unknown): PartnerRouteError => {
  console.error(`[${logTag}]`, err instanceof Error ? (err.stack ?? err.message) : String(err));
  return { ok: false, reason: 'Something went wrong. Please try again.' };
};
