import { CoreApiClient } from 'twenty-client-sdk/core';
import { buildWhatsAppCampaignSkipRecordInputs } from 'src/logic-functions/data/build-whatsapp-campaign-skip-record-inputs.util';

// the API caps the records one mutation can create
const SKIPS_PER_MUTATION = 100;

export const createWhatsAppCampaignSkips = async (params: Parameters<typeof buildWhatsAppCampaignSkipRecordInputs>[0]) => {
  const recordInputs = buildWhatsAppCampaignSkipRecordInputs(params);
  const client = new CoreApiClient();

  for (let start = 0; start < recordInputs.length; start += SKIPS_PER_MUTATION) {
    await client.mutation({
      createWhatsAppCampaignSkips: {
        __args: { data: recordInputs.slice(start, start + SKIPS_PER_MUTATION) },
        id: true,
      },
    });
  }
};
