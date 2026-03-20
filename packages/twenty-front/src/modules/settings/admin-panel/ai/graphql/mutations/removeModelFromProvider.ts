import { gql } from '@apollo/client';

export const REMOVE_MODEL_FROM_PROVIDER = gql`
  mutation RemoveModelFromProvider($providerName: String!, $name: String!) {
    removeModelFromProvider(providerName: $providerName, name: $name)
  }
`;
