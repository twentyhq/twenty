import { InstallPayload, definePostInstallLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

const handler = async (_payload: InstallPayload) => {
  const client = new CoreApiClient();

  const partnerResult = await client.mutation({
    createPartner: {
      __args: {
        data: {
          name: 'Test Partner Alpha',
          validationStage: 'VALIDATED',
          availability: 'AVAILABLE',
          languagesSpoken: ['ENGLISH', 'FRENCH'],
          deploymentExpertise: ['CLOUD', 'SELF_HOST'],
          region: 'EUROPE',
        },
      },
      id: true,
    },
  } as any);

  const partnerId = (partnerResult.createPartner as any).id;

  await client.mutation({
    createPerson: {
      __args: {
        data: {
          name: {
            firstName: 'Test Partner',
            lastName: 'Contact',
          },
          partnerId,
        },
      },
      id: true,
    },
  } as any);

  return { seeded: true, partnerId };
};

export default definePostInstallLogicFunction({
  universalIdentifier: 'f92bad2e-5905-4757-96ee-af9869d4ca0c',
  name: 'post-install',
  handler,
  shouldRunSynchronously: true,
});
