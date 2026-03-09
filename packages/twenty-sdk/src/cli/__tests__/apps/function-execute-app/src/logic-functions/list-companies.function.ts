import { CoreApiClient } from '@/clients';
import { defineLogicFunction } from '@/sdk';

export const LIST_COMPANIES_UNIVERSAL_IDENTIFIER =
  'b3a7e2c1-4f89-4d12-a6e3-9c8b1d0f5e7a';

const listCompaniesHandler = async () => {
  const coreClient = new CoreApiClient();

  const result = await coreClient.query({
    companies: {
      __args: { first: 3 },
      edges: { node: { name: true } },
    },
  });

  return { companies: result.companies };
};

export default defineLogicFunction({
  universalIdentifier: LIST_COMPANIES_UNIVERSAL_IDENTIFIER,
  name: 'list-companies',
  timeoutSeconds: 10,
  handler: listCompaniesHandler,
});
