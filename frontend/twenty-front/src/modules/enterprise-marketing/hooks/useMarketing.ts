import { gql } from '@apollo/client';

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
