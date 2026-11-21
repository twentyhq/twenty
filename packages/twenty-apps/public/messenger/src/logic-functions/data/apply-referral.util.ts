import { type CoreApiClient } from 'twenty-client-sdk/core';

import { buildReferralPersonFields } from 'src/logic-functions/data/build-referral-person-fields.util';
import { type MessengerReferral } from 'src/logic-functions/types/messenger-webhook.type';

export const applyReferral = async ({
  client,
  personId,
  referral,
  referredAt,
}: {
  client: CoreApiClient;
  personId: string;
  referral: MessengerReferral;
  referredAt: Date;
}) => {
  await client.mutation({
    updatePerson: {
      __args: {
        id: personId,
        data: buildReferralPersonFields({ referral, referredAt }),
      },
      id: true,
    },
  });
};
