import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { ON_WORKSPACE_MEMBER_CREATED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ensurePartnerRole } from 'src/modules/partner/onboarding/services/ensure-partner-role.service';
import { linkPartnerUser } from 'src/modules/partner/onboarding/services/link-partner-user.service';
import { resolvePartnerByEmail } from 'src/modules/partner/onboarding/services/resolve-partner-by-email.service';
import { normalizeInviteEmail } from 'src/modules/partner/onboarding/utils/normalize-invite-email';

type WorkspaceMemberCreated = { userEmail?: string | null };

export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordCreateEvent<WorkspaceMemberCreated>>,
): Promise<Record<string, unknown>> => {
  const memberId = payload.recordId;
  const rawEmail = payload.properties.after?.userEmail;
  if (!memberId || !rawEmail) return { skipped: true, reason: 'no_email' };

  const email = normalizeInviteEmail(rawEmail);
  if (email.endsWith('@twenty.com')) return { skipped: true, reason: 'internal_email' };

  const client = new CoreApiClient();
  const partnerId = await resolvePartnerByEmail(client, email);
  if (!partnerId) return { skipped: true, reason: 'no_partner_match' };

  const link = await linkPartnerUser(client, { partnerId, memberId });
  if (link.linked === false && link.reason === 'partner_already_linked_other') {
    return { skipped: true, reason: 'partner_already_linked' };
  }

  const role = await ensurePartnerRole(new MetadataApiClient(), memberId);
  return { ...link, role };
};

export default defineLogicFunction({
  universalIdentifier: ON_WORKSPACE_MEMBER_CREATED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-workspace-member-created',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: { eventName: 'workspaceMember.created' },
});
