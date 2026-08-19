import { TIMELINE_ACTIVITY_RULE_FRAGMENT } from '@/settings/data-model/timeline-rules/graphql/fragments/timelineActivityRuleFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_TIMELINE_ACTIVITY_RULES = gql`
  ${TIMELINE_ACTIVITY_RULE_FRAGMENT}
  query FindManyTimelineActivityRules {
    timelineActivityRules {
      ...TimelineActivityRuleFragment
    }
  }
`;
