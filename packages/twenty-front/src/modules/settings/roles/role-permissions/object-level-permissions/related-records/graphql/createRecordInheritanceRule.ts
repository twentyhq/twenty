import gql from 'graphql-tag';

import { RECORD_INHERITANCE_RULE_FRAGMENT } from '@/settings/roles/role-permissions/object-level-permissions/related-records/graphql/recordInheritanceRuleFragment';

export const CREATE_RECORD_INHERITANCE_RULE = gql`
  mutation CreateRecordInheritanceRule(
    $input: CreateRecordInheritanceRuleInput!
  ) {
    createRecordInheritanceRule(input: $input) {
      ...RecordInheritanceRuleFragment
    }
  }
  ${RECORD_INHERITANCE_RULE_FRAGMENT}
`;
