import gql from 'graphql-tag';

export const RECORD_INHERITANCE_RULE_FRAGMENT = gql`
  fragment RecordInheritanceRuleFragment on RecordInheritanceRule {
    id
    objectMetadataId
    parentObjectMetadataId
    fieldMetadataId
    junctionFieldMetadataId
  }
`;
