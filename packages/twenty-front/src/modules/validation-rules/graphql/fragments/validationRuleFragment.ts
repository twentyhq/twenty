import gql from 'graphql-tag';

export const VALIDATION_RULE_FRAGMENT = gql`
  fragment ValidationRuleFragment on ValidationRule {
    id
    objectMetadataId
    errorFieldMetadataId
    expression
    message
    isActive
  }
`;
