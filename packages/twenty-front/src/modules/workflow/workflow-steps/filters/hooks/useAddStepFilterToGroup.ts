import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/filters/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings';
import {
  ViewFilterOperand,
  type StepFilter,
  type StepFilterGroup,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

export const useAddStepFilterToGroup = ({
  stepFilterGroup,
}: {
  stepFilterGroup: StepFilterGroup;
}) => {
  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

  const { lastChildPosition } = useChildStepFiltersAndChildStepFilterGroups({
    stepFilterGroupId: stepFilterGroup.id,
  });

  const addStepFilterToGroup = () => {
    const newStepFilter = {
      id: v4(),
      type: 'unknown',
      value: '',
      operand: ViewFilterOperand.IS,
      stepOutputKey: '',
      stepFilterGroupId: stepFilterGroup.id,
      positionInStepFilterGroup: lastChildPosition + 1,
    } satisfies StepFilter;

    upsertStepFilterSettings({
      stepFilterToUpsert: newStepFilter,
    });
  };

  return {
    addStepFilterToGroup,
  };
};
