import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { createStepSelector } from '@/workflow/states/selectors/stepSelector';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useFilterCounter = ({ stepId }: { stepId: string }) => {
  const stepSelector = useMemo(() => createStepSelector(stepId), [stepId]);
  const step = useAtomComponentSelectorValue(stepSelector);

  if (!isDefined(step)) {
    return {
      filterCounter: 0,
    };
  }

  if (step.type === 'FILTER' && isDefined(step.settings?.input?.stepFilters)) {
    return {
      filterCounter: step.settings.input.stepFilters.length,
    };
  }

  return {
    filterCounter: 0,
  };
};
