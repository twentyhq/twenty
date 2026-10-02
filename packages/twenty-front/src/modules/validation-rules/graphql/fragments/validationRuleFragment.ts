import gql from 'graphql-tag';

export const VALIDATION_RULE_FRAGMENT = gql`
  fragment ValidationRuleFragment on ValidationRule {
    id
    objectMetadataId
    name
    description
    icon
    errorFieldMetadataId
    expression
    message
    isActive
  }
`;
