import { gql } from '@apollo/client';

export const createTimelineProjectionRule = gql`
  mutation CreateTimelineProjectionRule(
    $input: CreateTimelineProjectionRuleInput!
  ) {
    createTimelineProjectionRule(input: $input) {
      id
      anchorObjectMetadataId
      sourceObjectMetadataId
      linkedObjectMetadataIds
    }
  }
`;
