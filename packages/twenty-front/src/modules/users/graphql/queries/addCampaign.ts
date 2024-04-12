import { gql } from '@apollo/client';
export const ADD_CAMPAIGN = gql`
mutation CreateOneCampaignList($input: CampaignListCreateInput!) {
  createCampaignList(data: $input) {
    id
  }}`;


  