import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { ON_PARTNER_SERVICE_CREATED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

import { stampPartnerUserFromPartner } from './stamp-partner-user-on-child';

const resolvePartnerIdForMember = async (
  client: CoreApiClient,
  memberId: string,
): Promise<string | undefined> => {
  const partnerRes = await client.query({
    partners: {
      __args: { filter: { partnerUserId: { eq: memberId } }, first: 1 },
      edges: { node: { id: true } },
    },
  });

  return partnerRes.partners?.edges?.[0]?.node?.id;
};

export const handler = async (
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

    partnerId = await resolvePartnerIdForMember(client, memberId);
    if (!partnerId) return {};

    await client.mutation({
      updatePartnerService: {
        __args: {
          id: childId,
          data: {
            partnerId,
            partnerUserId: memberId,
          },
        },
        id: true,
      },
    });

    return { linked: true, partnerId };
  }

  await stampPartnerUserFromPartner(client, partnerId, 'partnerService', childId);
  return { stamped: true };
};

export default defineLogicFunction({
  universalIdentifier: ON_PARTNER_SERVICE_CREATED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-partner-service-created',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: { eventName: 'partnerService.created' },
});
