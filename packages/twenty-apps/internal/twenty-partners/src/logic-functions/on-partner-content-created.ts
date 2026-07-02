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

const needsCaseStudyContentType = (
  contentType: CoreSchema.PartnerContent['contentType'] | null | undefined,
): boolean => !contentType?.includes('CASE_STUDY');

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
            ...(needsCaseStudyContentType(after.contentType)
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

  if (needsCaseStudyContentType(after.contentType)) {
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
