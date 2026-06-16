import { gql } from '@apollo/client';

export const GET_WORKSPACE_BILLING_ADMIN_PANEL = gql`
  query WorkspaceBillingAdminPanel($workspaceId: UUID!) {
    workspaceBillingAdminPanel(workspaceId: $workspaceId) {
      stripeCustomerId
      creditBalance
      usage {
        periodStart
        periodEnd
        usedCredits
        grantedCredits
        rolloverCredits
        totalGrantedCredits
        remainingCredits
      }
      subscription {
        stripeSubscriptionId
        status
        interval
        currency
        planKey
        currentPeriodStart
        currentPeriodEnd
        trialStart
        trialEnd
        cancelAt
        canceledAt
        cancelAtPeriodEnd
        items {
          productName
          productKey
          stripePriceId
          quantity
          unitAmount
          includedCredits
        }
      }
    }
  }
`;
