import { gql } from '@apollo/client';

import { SHARING_RULE_FRAGMENT } from '@/settings/data-model/sharing/graphql/fragments/sharingRuleFragment';

export const UPDATE_SHARING_RULE = gql`
  ${SHARING_RULE_FRAGMENT}
  mutation UpdateSharingRule($input: UpdateSharingRuleInput!) {
    updateSharingRule(input: $input) {
      ...SharingRuleFields
    }
  }
`;
