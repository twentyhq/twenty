import { TIMELINE_ACTIVITY_RULE_FRAGMENT } from '@/settings/data-model/timeline-rules/graphql/fragments/timelineActivityRuleFragment';
import { gql } from '@apollo/client';

export const UPSERT_TIMELINE_ACTIVITY_RULE = gql`
  ${TIMELINE_ACTIVITY_RULE_FRAGMENT}
  mutation UpsertTimelineActivityRule(
    $input: UpsertTimelineActivityRuleInput!
  ) {
    upsertTimelineActivityRule(input: $input) {
      ...TimelineActivityRuleFragment
    }
  }
`;
