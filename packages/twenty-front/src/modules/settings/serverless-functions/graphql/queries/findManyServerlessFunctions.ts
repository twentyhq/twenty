import { gql } from '@apollo/client';
import { SERVERLESS_FUNCTION_FRAGMENT } from '@/settings/serverless-functions/graphql/fragments/serverlessFunctionFragment';

export const FIND_MANY_SERVERLESS_FUNCTIONS = gql`
  ${SERVERLESS_FUNCTION_FRAGMENT}
  query GetManyServerlessFunctions {
    findManyServerlessFunctions {
      ...ServerlessFunctionFields
    }
  }
`;
