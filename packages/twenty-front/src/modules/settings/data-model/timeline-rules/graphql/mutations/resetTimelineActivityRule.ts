import { TIMELINE_ACTIVITY_RULE_FRAGMENT } from '@/settings/data-model/timeline-rules/graphql/fragments/timelineActivityRuleFragment';
import { gql } from '@apollo/client';

export const RESET_TIMELINE_ACTIVITY_RULE = gql`
  ${TIMELINE_ACTIVITY_RULE_FRAGMENT}
  mutation ResetTimelineActivityRule($input: ResetTimelineActivityRuleInput!) {
    resetTimelineActivityRule(input: $input) {
      ...TimelineActivityRuleFragment
    }
  }
`;
