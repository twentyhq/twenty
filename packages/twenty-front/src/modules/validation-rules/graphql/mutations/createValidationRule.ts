import gql from 'graphql-tag';

import { VALIDATION_RULE_FRAGMENT } from '@/validation-rules/graphql/fragments/validationRuleFragment';

export const CREATE_VALIDATION_RULE = gql`
  mutation CreateValidationRule($input: CreateValidationRuleInput!) {
    createValidationRule(input: $input) {
      ...ValidationRuleFragment
    }
  }
  ${VALIDATION_RULE_FRAGMENT}
`;
