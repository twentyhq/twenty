import { type ConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';

// TODO(@neo773): a widget holds its rule in one place, so a new tree empties the two legacy fields; stop one release after stored rules are converted to trees
export const getWidgetConditionalAvailabilityUpdate = ({
  conditionalAvailability,
}: {
  conditionalAvailability: ConditionalEvaluationNode | null;
}) => ({
  conditionalAvailability,
  conditionalAvailabilityExpression: null,
  conditionalDisplay: null,
});
