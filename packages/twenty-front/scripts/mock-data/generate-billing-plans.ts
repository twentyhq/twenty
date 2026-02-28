/* eslint-disable no-console */
import { graphqlRequest, writeGeneratedFile } from './utils.js';

const LIST_PLANS_QUERY = `
  query listPlans {
    listPlans {
      planKey
      licensedProducts {
        name
        description
        images
        metadata {
          productKey
          planKey
          priceUsageBased
        }
        ... on BillingLicensedProduct {
          prices {
            stripePriceId
            unitAmount
            recurringInterval
            priceUsageType
          }
        }
      }
      meteredProducts {
        name
        description
        images
        metadata {
          productKey
          planKey
          priceUsageBased
        }
        ... on BillingMeteredProduct {
          prices {
            priceUsageType
            recurringInterval
            stripePriceId
            tiers {
              flatAmount
              unitAmount
              upTo
            }
          }
        }
      }
    }
  }
`;

export const generateBillingPlans = async (token: string) => {
  console.log('Fetching billing plans from /metadata ...');

  const data = (await graphqlRequest('/metadata', LIST_PLANS_QUERY, token)) as {
    listPlans: Record<string, unknown>[];
  };

  console.log(`  Got ${data.listPlans.length} billing plans.`);

  writeGeneratedFile(
    'metadata/billing-plans/mock-billing-plans-data.ts',
    'mockedBillingPlans',
    'Record<string, unknown>',
    '',
    { listPlans: data.listPlans },
  );
};
