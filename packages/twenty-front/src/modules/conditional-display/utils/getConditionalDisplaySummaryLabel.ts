import { type ConditionalDisplayConditionName } from '@/conditional-display/types/ConditionalDisplayConditionName';
import { t } from '@lingui/core/macro';
import { type ConditionalDisplay } from 'twenty-shared/types';
import { assertUnreachable, isNonEmptyArray } from 'twenty-shared/utils';

export const getConditionalDisplaySummaryLabel = ({
  conditionName,
  conditionalDisplay,
}: {
  conditionName: ConditionalDisplayConditionName;
  conditionalDisplay: ConditionalDisplay | null | undefined;
}): string => {
  if (isNonEmptyArray(conditionalDisplay?.recordFilters)) {
    return t`Custom rule`;
  }

  switch (conditionName) {
    case 'conditionalDisplay':
      return t`Everyone`;
    case 'conditionalAvailability':
      return t`Always`;
    default:
      return assertUnreachable(conditionName);
  }
};
