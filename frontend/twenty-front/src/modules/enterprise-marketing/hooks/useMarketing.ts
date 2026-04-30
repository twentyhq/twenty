import { gql } from '@apollo/client';

export const GET_CAMPAIGNS = gql`
  query GetCampaigns($status: CampaignStatus, $limit: Int, $offset: Int) {
    campaigns(status: $status, limit: $limit, offset: $offset) {
      edges {
        node {
          id
          name
          status
          channel
          budget
          spent
          leads
          roi
          currency
          startDate
          endDate
        }
      }
      totalCount
    }
  }
`;

export const GET_LEAD_SCORING_RULES = gql`
  query GetLeadScoringRules {
    leadScoringRules {
      rules {
        id
        attribute
        condition
        value
        points
        isActive
      }
    }
  }
`;

export const GET_ATTRIBUTION_DATA = gql`
  query GetAttributionData($model: AttributionModel!) {
    attributionData(model: $model) {
      touchpoints {
        channel
        touchCount
        weight
        revenue
        currency
      }
    }
  }
`;

export const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($input: CreateCampaignInput!) {
    createCampaign(input: $input) {
      id
      name
      status
      channel
      budget
      spent
      leads
      roi
      currency
      startDate
      endDate
    }
  }
`;

export const LAUNCH_CAMPAIGN = gql`
  mutation LaunchCampaign($campaignId: ID!) {
    launchCampaign(campaignId: $campaignId) {
      id
      name
      status
      launchedAt
    }
  }
`;

export const PROCESS_LEAD_ACTION = gql`
  mutation ProcessLeadAction($input: LeadActionInput!) {
    processLeadAction(input: $input) {
      leadId
      action
      newScore
      newStage
      processedAt
    }
  }
`;

export const GET_CAMPAIGN_ROI = gql`
  query GetCampaignROI($campaignId: ID!) {
    campaignROI(campaignId: $campaignId) {
      campaignId
      campaignName
      totalSpend
      totalRevenue
      roi
      costPerLead
      costPerAcquisition
      leadsGenerated
      conversions
      currency
      byChannel {
        channel
        spend
        revenue
        roi
      }
    }
  }
`;

export const HANDOFF_TO_SALES = gql`
  mutation HandoffToSales($leadId: ID!, $input: HandoffInput!) {
    handoffToSales(leadId: $leadId, input: $input) {
      leadId
      leadName
      assignedSalesRepId
      assignedSalesRepName
      score
      qualificationNotes
      handoffAt
    }
  }
`;
