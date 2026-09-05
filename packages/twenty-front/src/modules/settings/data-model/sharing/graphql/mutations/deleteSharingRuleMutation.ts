import { gql } from '@apollo/client';

import { SHARING_RULE_FRAGMENT } from '@/settings/data-model/sharing/graphql/fragments/sharingRuleFragment';

export const DELETE_SHARING_RULE = gql`
  ${SHARING_RULE_FRAGMENT}
  mutation DeleteSharingRule($id: UUID!) {
    deleteSharingRule(id: $id) {
      ...SharingRuleFields
    }
  }
`;
