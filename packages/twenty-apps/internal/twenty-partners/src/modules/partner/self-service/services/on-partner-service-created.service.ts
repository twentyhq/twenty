import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { updatePartnerService } from 'src/modules/partner/self-service/graphql/mutations/update-partner-service';
import { findPartnerByMember } from 'src/modules/partner/self-service/graphql/queries/find-partner-by-member';
import { stampPartnerUserFromPartner } from 'src/modules/partner/self-service/services/stamp-partner-user-on-child.service';

export const onPartnerServiceCreated = async (
  payload: DatabaseEventPayload<ObjectRecordCreateEvent<CoreSchema.PartnerService>>,
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

    await updatePartnerService(client, childId, {
      partnerId,
      partnerUserId: memberId,
    });

    return { linked: true, partnerId };
  }

  await stampPartnerUserFromPartner(client, partnerId, 'partnerService', childId);
  return { stamped: true };
};
