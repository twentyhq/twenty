/* oxlint-disable no-console */
import { graphqlRequest, writeGeneratedFile } from './utils.js';

const BILLING_PLANS_QUERY = `
  query BillingPlans {
    billingPlans {
      planKey
      isSellable
      upgradePlanKeys
      downgradePlanKeys
      licensedProducts {
        name
        description
        images
        metadata {
          productKey
          planKey
        }
        ... on BillingLicensedProduct {
          prices {
            stripePriceId
            unitAmount
            recurringInterval
          }
        }
      }
    }
  }
`;

export const generateBillingPlans = async (token: string) => {
  console.log('Fetching billing plans from /metadata ...');

  const data = (await graphqlRequest(
    '/metadata',
    BILLING_PLANS_QUERY,
    token,
  )) as {
    billingPlans: Record<string, unknown>[];
  };

  console.log(`  Got ${data.billingPlans.length} billing plans.`);

  writeGeneratedFile(
    'metadata/billing-plans/mock-billing-plans-data.ts',
    'mockedBillingPlans',
    'Record<string, unknown>',
    '',
    { billingPlans: data.billingPlans },
  );
};
