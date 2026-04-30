import { gql } from '@apollo/client';

export const GET_CHANNEL_ANALYTICS = gql`
  query GetChannelAnalytics($dateRange: DateRangeInput) {
    channelAnalytics(dateRange: $dateRange) {
      totalPartners
      activePartners
      totalChannelRevenue
      avgDealSize
      dealRegistrationCount
      approvalRate
      currency
      byTier {
        tier
        partnerCount
        revenue
      }
    }
  }
`;

export const RECRUIT_PARTNER = gql`
  mutation RecruitPartner($input: RecruitPartnerInput!) {
    recruitPartner(input: $input) {
      id
      companyName
      contactName
      tier
      dealCount
      revenue
      currency
      region
      joinedAt
    }
  }
`;

export const REGISTER_DEAL = gql`
  mutation RegisterDeal($input: RegisterDealInput!) {
    registerDeal(input: $input) {
      id
      partnerId
      partnerName
      dealName
      value
      currency
      status
      submittedAt
      expiresAt
    }
  }
`;

export const REQUEST_MDF = gql`
  mutation RequestMDF($input: MDFRequestInput!) {
    requestMDF(input: $input) {
      id
      partnerId
      partnerName
      amount
      currency
      purpose
      status
      submittedAt
    }
  }
`;

export const GET_PARTNER_LEADERBOARD = gql`
  query GetPartnerLeaderboard(
    $dateRange: DateRangeInput
    $tierFilter: PartnerTier
    $limit: Int
  ) {
    partnerLeaderboard(
      dateRange: $dateRange
      tierFilter: $tierFilter
      limit: $limit
    ) {
      rankings {
        rank
        partnerId
        partnerName
        tier
        totalRevenue
        dealsWon
        currency
      }
    }
  }
`;
