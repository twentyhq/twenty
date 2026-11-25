import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';
import { buildWhatsAppAdReferralRecordInput } from 'src/logic-functions/data/build-whatsapp-ad-referral-record-input.util';
import { createWhatsAppAdReferralOpportunity } from 'src/logic-functions/data/create-whatsapp-ad-referral-opportunity.util';
import { getAdReferralSettings } from 'src/logic-functions/data/get-ad-referral-settings.util';

// a retried import finds the referral of its first attempt by person and message time, and only adds what is missing
export const recordWhatsAppAdReferral = async ({
  client,
  ...input
}: { client: CoreApiClient } & Parameters<typeof buildWhatsAppAdReferralRecordInput>[0]) => {
  const adReferralInput = buildWhatsAppAdReferralRecordInput(input);
  const { whatsAppAdReferral: existingReferral } = await client.query({
    whatsAppAdReferral: {
      __args: {
        filter: { personId: { eq: adReferralInput.personId }, referredAt: { eq: adReferralInput.referredAt } },
      },
      id: true,
      opportunityId: true,
    },
  });
  const referral =
    existingReferral ??
    (
      await client.mutation({
        createWhatsAppAdReferral: { __args: { data: adReferralInput }, id: true, opportunityId: true },
      })
    ).createWhatsAppAdReferral;

  if (isDefined(referral.opportunityId) || !(await getAdReferralSettings()).isOpportunityCreated) {
    return;
  }

  const opportunityId = await createWhatsAppAdReferralOpportunity({
    client,
    personId: adReferralInput.personId,
    adHeadline: adReferralInput.headline,
  });

  await client.mutation({
    updateWhatsAppAdReferral: { __args: { id: referral.id, data: { opportunityId } }, id: true },
  });
};
