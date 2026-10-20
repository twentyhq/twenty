import gql from 'graphql-tag';

import { RECORD_INHERITANCE_RULE_FRAGMENT } from '@/settings/roles/role-permissions/object-level-permissions/related-records/graphql/recordInheritanceRuleFragment';

export const DELETE_RECORD_INHERITANCE_RULE = gql`
  mutation DeleteRecordInheritanceRule($id: UUID!) {
    deleteRecordInheritanceRule(id: $id) {
      ...RecordInheritanceRuleFragment
    }
  }
  ${RECORD_INHERITANCE_RULE_FRAGMENT}
`;
