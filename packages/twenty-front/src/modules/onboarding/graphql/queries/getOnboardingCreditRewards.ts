import { gql } from '@apollo/client';

export const GET_ONBOARDING_CREDIT_REWARDS = gql`
  query GetOnboardingCreditRewards {
    getOnboardingCreditRewards {
      importContactsCredits
      installAppsCredits
      inviteTeamCredits
      enrichmentQualificationCredits
      totalCredits
      joinedTeammatesCount
      pendingInvitationsCount
    }
  }
`;
