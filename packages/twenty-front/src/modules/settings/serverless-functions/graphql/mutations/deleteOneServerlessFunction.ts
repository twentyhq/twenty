import { gql } from '@apollo/client';
import { SERVERLESS_FUNCTION_FRAGMENT } from '@/settings/serverless-functions/graphql/fragments/serverlessFunctionFragment';

export const DELETE_ONE_SERVERLESS_FUNCTION = gql`
  ${SERVERLESS_FUNCTION_FRAGMENT}
  mutation DeleteOneServerlessFunction($input: ServerlessFunctionIdInput!) {
    deleteOneServerlessFunction(input: $input) {
      ...ServerlessFunctionFields
    }
  }
`;
