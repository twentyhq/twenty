import { gql } from '@apollo/client';

export const GET_ASSETS = gql`
  query GetAssets {
    assets {
      id
      name
      type
      serialNumber
      assignee
      status
      purchaseDate
      warrantyExpiry
      value
    }
  }
`;

export const CREATE_ASSET = gql`
  mutation CreateAsset($input: AssetInput!) {
    createAsset(input: $input) {
      id
    }
  }
`;
