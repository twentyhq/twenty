import gql from 'graphql-tag';

import { VALIDATION_RULE_FRAGMENT } from '@/validation-rules/graphql/fragments/validationRuleFragment';

export const FIND_VALIDATION_RULES_READING_FIELD = gql`
  query FindValidationRulesReadingField($fieldMetadataId: UUID!) {
    validationRulesReadingField(fieldMetadataId: $fieldMetadataId) {
      ...ValidationRuleFragment
    }
  }
  ${VALIDATION_RULE_FRAGMENT}
`;
