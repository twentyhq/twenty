import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { findOrCreateWhatsAppPersonId } from 'src/logic-functions/data/find-or-create-whatsapp-person-id.util';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

// the person is created when unknown, so the opt-out still applies if they are contacted later
export const updateWhatsAppMarketingPreference = async ({
  identity,
  name,
  isOptedOut,
  updatedAt,
}: {
  identity: WhatsAppIdentity;
  name?: string;
  isOptedOut: boolean;
  updatedAt: Date;
}) => {
  if (!isNonEmptyString(identity.whatsAppId) && !isNonEmptyString(identity.whatsAppUserId)) {
    return;
  }

  const client = new CoreApiClient();
  const personId = await findOrCreateWhatsAppPersonId({ client, identity, name });

  const { person } = await client.query({
    person: {
      __args: { filter: { id: { eq: personId } } },
      whatsAppMarketingPreferenceUpdatedAt: true,
    },
  });
  const previousUpdatedAt: unknown = person?.whatsAppMarketingPreferenceUpdatedAt;

  // Meta retries deliveries, so a stop and a resume can arrive out of order
  if (isNonEmptyString(previousUpdatedAt) && new Date(previousUpdatedAt).getTime() >= updatedAt.getTime()) {
    return;
  }

  await client.mutation({
    updatePerson: {
      __args: {
        id: personId,
        data: {
          whatsAppMarketingOptOut: isOptedOut,
          whatsAppMarketingPreferenceUpdatedAt: updatedAt.toISOString(),
        },
      },
      id: true,
    },
  });
};
