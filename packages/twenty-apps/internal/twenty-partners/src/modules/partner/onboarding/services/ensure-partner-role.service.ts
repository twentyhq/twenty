import { type MetadataApiClient } from 'twenty-client-sdk/metadata';

import { PARTNER_ROLE_LABEL } from 'src/roles/partner.role';
import { assignWorkspaceMemberRole } from 'src/modules/partner/onboarding/graphql/mutations/assign-workspace-member-role';
import { getRolesWithMembers } from 'src/modules/partner/onboarding/graphql/queries/get-partner-role';

export type EnsurePartnerRoleResult =
  | { roleOk: true; assigned: boolean }
  | { roleOk: false; reason: 'partner_role_not_found' };

export async function ensurePartnerRole(
  client: MetadataApiClient,
  memberId: string,
): Promise<EnsurePartnerRoleResult> {
  const res = await getRolesWithMembers(client);
  const role = res.getRoles?.find((r) => r?.label === PARTNER_ROLE_LABEL);
  if (!role?.id) return { roleOk: false, reason: 'partner_role_not_found' };

  const alreadyHasRole = (role.workspaceMembers ?? []).some((m) => m?.id === memberId);
  if (alreadyHasRole) return { roleOk: true, assigned: false };

  await assignWorkspaceMemberRole(client, memberId, role.id);
  return { roleOk: true, assigned: true };
}
