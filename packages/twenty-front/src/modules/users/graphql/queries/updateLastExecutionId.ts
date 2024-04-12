import { gql } from '@apollo/client';

export const UPDATE_LAST_EXECUTION_ID = gql`
mutation UpdateOneCampaignList($idToUpdate: ID!, $input: CampaignListUpdateInput!) {
    updateCampaignList(id: $idToUpdate, data: $input) {
      id
    }
  }
`;