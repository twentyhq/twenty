import gql from 'graphql-tag';

import { VALIDATION_RULE_FRAGMENT } from '@/validation-rules/graphql/fragments/validationRuleFragment';

export const FIND_MANY_VALIDATION_RULES = gql`
  query FindManyValidationRules($objectMetadataId: UUID!) {
    validationRules(objectMetadataId: $objectMetadataId) {
      ...ValidationRuleFragment
    }
  }
  ${VALIDATION_RULE_FRAGMENT}
`;
