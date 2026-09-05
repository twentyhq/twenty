import { gql } from '@apollo/client';

import { SHARING_RULE_FRAGMENT } from '@/settings/data-model/sharing/graphql/fragments/sharingRuleFragment';

export const CREATE_SHARING_RULE = gql`
  ${SHARING_RULE_FRAGMENT}
  mutation CreateSharingRule($input: CreateSharingRuleInput!) {
    createSharingRule(input: $input) {
      ...SharingRuleFields
    }
  }
`;
