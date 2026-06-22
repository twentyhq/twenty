import { gql } from '@apollo/client';

export const deleteTimelineProjectionRule = gql`
  mutation DeleteTimelineProjectionRule(
    $input: DeleteTimelineProjectionRuleInput!
  ) {
    deleteTimelineProjectionRule(input: $input)
  }
`;
