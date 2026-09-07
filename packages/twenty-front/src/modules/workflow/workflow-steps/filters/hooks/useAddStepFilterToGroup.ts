import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/filters/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings';
import { buildEmptyStepFilter } from '@/workflow/workflow-steps/filters/utils/buildEmptyStepFilter';
import { type StepFilterGroup } from 'twenty-shared/types';

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
    upsertStepFilterSettings({
      stepFilterToUpsert: buildEmptyStepFilter({
        stepFilterGroupId: stepFilterGroup.id,
        positionInStepFilterGroup: lastChildPosition + 1,
      }),
    });
  };

  return {
    addStepFilterToGroup,
  };
};
