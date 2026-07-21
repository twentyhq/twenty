import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { ON_PARTNER_CONTENT_CREATED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

import { stampPartnerUserFromPartner } from './stamp-partner-user-on-child';

const CASE_STUDY_CONTENT_TYPE: CoreSchema.PartnerContent['contentType'] = [
  'CASE_STUDY',
];

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

// Default to CASE_STUDY only when the caller left contentType empty (the self-service path);
// an explicit CUSTOMER_QUOTE / PARTNER_QUOTE / LOGO must be preserved, not overwritten.
const hasNoContentType = (
  contentType: CoreSchema.PartnerContent['contentType'] | null | undefined,
): boolean => !contentType || contentType.length === 0;

export const handler = async (
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

    partnerId = await resolvePartnerIdForMember(client, memberId);
    if (!partnerId) return {};

    await client.mutation({
      updatePartnerContent: {
        __args: {
          id: childId,
          data: {
            partnerId,
            partnerUserId: memberId,
            ...(hasNoContentType(after.contentType)
              ? { contentType: CASE_STUDY_CONTENT_TYPE }
              : {}),
          },
        },
        id: true,
      },
    });

    return { linked: true, partnerId };
  }

  await stampPartnerUserFromPartner(client, partnerId, 'partnerContent', childId);

  if (hasNoContentType(after.contentType)) {
    await client.mutation({
      updatePartnerContent: {
        __args: {
          id: childId,
          data: { contentType: CASE_STUDY_CONTENT_TYPE },
        },
        id: true,
      },
    });
  }

  return { stamped: true };
};

export default defineLogicFunction({
  universalIdentifier: ON_PARTNER_CONTENT_CREATED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-partner-content-created',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: { eventName: 'partnerContent.created' },
});
