import { gql } from '@apollo/client';
import { SERVERLESS_FUNCTION_FRAGMENT } from '@/settings/serverless-functions/graphql/fragments/serverlessFunctionFragment';

export const FIND_ONE_SERVERLESS_FUNCTION = gql`
  ${SERVERLESS_FUNCTION_FRAGMENT}
  query GetOneServerlessFunction($input: ServerlessFunctionIdInput!) {
    findOneServerlessFunction(input: $input) {
      ...ServerlessFunctionFields
    }
  }
`;
