import gql from 'graphql-tag';

import { RECORD_INHERITANCE_RULE_FRAGMENT } from '@/settings/roles/role-permissions/object-level-permissions/related-records/graphql/recordInheritanceRuleFragment';

export const FIND_MANY_RECORD_INHERITANCE_RULES = gql`
  query FindManyRecordInheritanceRules {
    recordInheritanceRules {
      ...RecordInheritanceRuleFragment
    }
  }
  ${RECORD_INHERITANCE_RULE_FRAGMENT}
`;
