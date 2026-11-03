import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { type WorkflowCronScheduleDraftState } from '@/workflow/workflow-trigger/types/WorkflowCronScheduleDraftState';
import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/convertScheduleToCronExpression';
import { getCronScheduleDraftFromSettings } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftFromSettings';
import { getCronScheduleDraftResult } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftResult';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const reconcileWorkflowCronScheduleDraft = ({
  current,
  settings,
}: {
  current: WorkflowCronScheduleDraftState;
  settings: WorkflowCronTrigger['settings'];
}): WorkflowCronScheduleDraftState => {
  const result = getCronScheduleDraftResult(current.draft);
  const isUntouched =
    isDeeplyEqual(
      current.draft,
      getCronScheduleDraftFromSettings(current.sourceSettings),
    ) ||
    (isDefined(result.settings) &&
      convertScheduleToCronExpression({ settings: result.settings }) ===
        convertScheduleToCronExpression({ settings: current.sourceSettings }));
  return {
    sourceSettings: settings,
    draft: isUntouched
      ? getCronScheduleDraftFromSettings(settings)
      : current.draft,
  };
};
