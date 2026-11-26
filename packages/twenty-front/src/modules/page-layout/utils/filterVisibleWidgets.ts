import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { evaluateWidgetVisibility } from '@/page-layout/utils/evaluateWidgetVisibility';
import { evaluateConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type FilterVisibleWidgetsParams = {
  widgets: PageLayoutTab['widgets'];
  context: WidgetVisibilityContext;
};

export const filterVisibleWidgets = ({
  widgets,
  context,
}: FilterVisibleWidgetsParams): PageLayoutTab['widgets'] => {
  const isWidgetConditionalAvailabilityEnabled =
    context.featureFlags[
      FeatureFlagKey.IS_WIDGET_CONDITIONAL_AVAILABILITY_ENABLED
    ] ?? false;

  // TODO(@neo773): a workspace without the flag still reads its legacy rules; drop this branch with the two legacy rule columns
  if (!isWidgetConditionalAvailabilityEnabled) {
    return widgets.filter((widget) =>
      evaluateWidgetVisibility({
        conditionalAvailabilityExpression:
          widget.conditionalAvailabilityExpression,
        conditionalDisplay: widget.conditionalDisplay,
        conditionalAvailability: widget.conditionalAvailability,
        context,
      }),
    );
  }

  return widgets.filter((widget) =>
    evaluateConditionalEvaluationNode({
      node: widget.conditionalAvailability,
      context,
    }),
  );
};
