import { gql } from '@apollo/client';

export const ADD_MODEL_TO_PROVIDER = gql`
  mutation AddModelToProvider($providerName: String!, $modelConfig: JSON!) {
    addModelToProvider(providerName: $providerName, modelConfig: $modelConfig)
  }
`;
