import gql from 'graphql-tag';

import { VALIDATION_RULE_FRAGMENT } from '@/validation-rules/graphql/fragments/validationRuleFragment';

export const DELETE_VALIDATION_RULE = gql`
  mutation DeleteValidationRule($id: UUID!) {
    deleteValidationRule(id: $id) {
      ...ValidationRuleFragment
    }
  }
  ${VALIDATION_RULE_FRAGMENT}
`;
