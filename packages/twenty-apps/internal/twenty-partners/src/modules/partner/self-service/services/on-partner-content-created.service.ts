import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { updatePartnerContent } from 'src/modules/partner/self-service/graphql/mutations/update-partner-content';
import { findPartnerByMember } from 'src/modules/partner/self-service/graphql/queries/find-partner-by-member';
import { stampPartnerUserFromPartner } from 'src/modules/partner/self-service/services/stamp-partner-user-on-child.service';

const CASE_STUDY_CONTENT_TYPE: CoreSchema.PartnerContent['contentType'] = [
  'CASE_STUDY',
];

// Default to CASE_STUDY only when the caller left contentType empty (the self-service path);
// an explicit CUSTOMER_QUOTE / PARTNER_QUOTE / LOGO must be preserved, not overwritten.
const hasNoContentType = (
  contentType: CoreSchema.PartnerContent['contentType'] | null | undefined,
): boolean => !contentType || contentType.length === 0;

export const onPartnerContentCreated = async (
  payload: DatabaseEventPayload<ObjectRecordCreateEvent<CoreSchema.PartnerContent>>,
): Promise<Record<string, unknown>> => {
  const after = payload.properties.after;
  const childId = after?.id;
  if (!childId) return {};

  const client = new CoreApiClient();
  let partnerId = after.partnerId;

  if (!partnerId) {
    const memberId = after.createdBy?.workspaceMemberId;
    if (!memberId) return {};

    const partnerRes = await findPartnerByMember(client, memberId);
    partnerId = partnerRes.partners?.edges?.[0]?.node?.id;
    if (!partnerId) return {};

    await updatePartnerContent(client, childId, {
      partnerId,
      partnerUserId: memberId,
      ...(hasNoContentType(after.contentType)
        ? { contentType: CASE_STUDY_CONTENT_TYPE }
        : {}),
    });

    return { linked: true, partnerId };
  }

  await stampPartnerUserFromPartner(client, partnerId, 'partnerContent', childId);

  if (hasNoContentType(after.contentType)) {
    await updatePartnerContent(client, childId, { contentType: CASE_STUDY_CONTENT_TYPE });
  }

  return { stamped: true };
};
