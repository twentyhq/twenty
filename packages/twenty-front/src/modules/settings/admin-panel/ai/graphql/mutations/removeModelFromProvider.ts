import { gql } from '@apollo/client';

export const REMOVE_MODEL_FROM_PROVIDER = gql`
  mutation RemoveModelFromProvider(
    $providerName: String!
    $rawModelId: String!
  ) {
    removeModelFromProvider(
      providerName: $providerName
      rawModelId: $rawModelId
    )
  }
`;
