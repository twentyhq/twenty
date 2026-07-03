import { CoreApiClient } from 'twenty-client-sdk/core';

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
    return JSON.parse(json);
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

  const resolved = await resolvePartnerByUserId(new CoreApiClient(), claims.userId);
  return resolved ?? { error: 'NO_PARTNER' };
};

export type PartnerRouteError = { ok: false; reason: string };

export const errorResponse = (reason: string): PartnerRouteError => ({
  ok: false,
  reason,
});
