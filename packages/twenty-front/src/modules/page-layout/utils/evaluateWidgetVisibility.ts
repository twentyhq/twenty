import { type ConditionalDisplay } from 'twenty-shared/types';
import {
  evaluateConditionalAvailabilityExpression,
  isDefined,
} from 'twenty-shared/utils';

import { evaluateConditionalDisplay } from '@/conditional-display/utils/evaluateConditionalDisplay';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';

type EvaluateWidgetVisibilityParams = {
  conditionalAvailabilityExpression: string | null | undefined;
  conditionalDisplay: ConditionalDisplay | null | undefined;
  context: WidgetVisibilityContext;
};

export const evaluateWidgetVisibility = ({
  conditionalAvailabilityExpression,
  conditionalDisplay,
  context,
}: EvaluateWidgetVisibilityParams): boolean => {
  const isAvailable =
    !isDefined(conditionalAvailabilityExpression) ||
    evaluateConditionalAvailabilityExpression(
      conditionalAvailabilityExpression,
      context,
    );

  return (
    isAvailable &&
    evaluateConditionalDisplay({
      conditionalDisplay,
      context,
      records: context.selectedRecords,
      objectMetadataItem: context.objectMetadataItem,
      objectMetadataItems: context.objectMetadataItems,
    })
  );
};
