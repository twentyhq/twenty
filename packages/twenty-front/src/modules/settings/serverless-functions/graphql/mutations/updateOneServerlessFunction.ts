import { gql } from '@apollo/client';
import { SERVERLESS_FUNCTION_FRAGMENT } from '@/settings/serverless-functions/graphql/fragments/serverlessFunctionFragment';

export const UPDATE_ONE_SERVERLESS_FUNCTION = gql`
  ${SERVERLESS_FUNCTION_FRAGMENT}
  mutation UpdateOneServerlessFunction($input: UpdateServerlessFunctionInput!) {
    updateOneServerlessFunction(input: $input) {
      ...ServerlessFunctionFields
    }
  }
`;
