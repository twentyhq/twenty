import gql from 'graphql-tag';

import { VALIDATION_RULE_FRAGMENT } from '@/validation-rules/graphql/fragments/validationRuleFragment';

export const UPDATE_VALIDATION_RULE = gql`
  mutation UpdateValidationRule($input: UpdateValidationRuleInput!) {
    updateValidationRule(input: $input) {
      ...ValidationRuleFragment
    }
  }
  ${VALIDATION_RULE_FRAGMENT}
`;
