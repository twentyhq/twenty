import { type CoreApiClient } from 'twenty-client-sdk/core';

import { buildReferralPersonFields } from 'src/logic-functions/data/build-referral-person-fields.util';
import {
  claimAdOpportunity,
  releaseAdOpportunity,
} from 'src/logic-functions/data/claim-ad-opportunity.util';
import { createAdOpportunity } from 'src/logic-functions/data/create-ad-opportunity.util';
import { getAdReferralSettings } from 'src/logic-functions/data/get-ad-referral-settings.util';
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

  if (
    referral.source === 'ADS' &&
    (await getAdReferralSettings()).isOpportunityCreated &&
    (await claimAdOpportunity({ personId, referral }))
  ) {
    try {
      await createAdOpportunity({
        client,
        personId,
        adTitle: referral.ads_context_data?.ad_title,
      });
    } catch (error) {
      await releaseAdOpportunity({ personId, referral });

      throw error;
    }
  }
};
