import { gql } from '@apollo/client';

export const updateTimelineProjectionRule = gql`
  mutation UpdateTimelineProjectionRule(
    $input: UpdateTimelineProjectionRuleInput!
  ) {
    updateTimelineProjectionRule(input: $input) {
      id
      anchorObjectMetadataId
      sourceObjectMetadataId
      linkedObjectMetadataIds
    }
  }
`;
