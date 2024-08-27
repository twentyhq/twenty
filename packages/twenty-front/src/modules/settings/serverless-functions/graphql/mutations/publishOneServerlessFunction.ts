import { gql } from '@apollo/client';
import { SERVERLESS_FUNCTION_FRAGMENT } from '@/settings/serverless-functions/graphql/fragments/serverlessFunctionFragment';

export const PUBLISH_ONE_SERVERLESS_FUNCTION = gql`
  ${SERVERLESS_FUNCTION_FRAGMENT}
  mutation PublishOneServerlessFunction(
    $input: PublishServerlessFunctionInput!
  ) {
    publishServerlessFunction(input: $input) {
      ...ServerlessFunctionFields
    }
  }
`;
