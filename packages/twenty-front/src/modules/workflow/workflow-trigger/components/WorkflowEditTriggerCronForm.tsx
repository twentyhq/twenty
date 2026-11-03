import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { CronExpressionHelperLazy } from '@/workflow/workflow-trigger/components/CronExpressionHelperLazy';
import { CronScheduleFields } from '@/workflow/workflow-trigger/components/CronScheduleFields';
import { WorkflowCronScheduleDraftSyncEffect } from '@/workflow/workflow-trigger/components/WorkflowCronScheduleDraftSyncEffect';
import { type CronScheduleDraft } from '@/workflow/workflow-trigger/types/CronScheduleDraft';
import { type WorkflowCronScheduleDraftState } from '@/workflow/workflow-trigger/types/WorkflowCronScheduleDraftState';
import { getCronScheduleDraftFromSettings } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftFromSettings';
import { getCronScheduleDraftResult } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftResult';
import { mergeCronScheduleSettings } from '@/workflow/workflow-trigger/utils/mergeCronScheduleSettings';
import { atom, useAtomValue, useStore } from 'jotai';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

type WorkflowEditTriggerCronFormProps = {
  trigger: WorkflowCronTrigger;
  triggerOptions:
    | { readonly: true; onTriggerUpdate?: undefined }
    | {
        readonly?: false;
        onTriggerUpdate: (trigger: WorkflowCronTrigger) => void;
      };
};

export const WorkflowEditTriggerCronForm = ({
  trigger,
  triggerOptions,
}: WorkflowEditTriggerCronFormProps) => {
  const store = useStore();
  const [draftAtom] = useState(() =>
    atom<WorkflowCronScheduleDraftState>({
      sourceSettings: trigger.settings,
      draft: getCronScheduleDraftFromSettings(trigger.settings),
    }),
  );
  const { draft } = useAtomValue(draftAtom);
  const result = getCronScheduleDraftResult(draft);
  const updateDraft = (
    update: (current: CronScheduleDraft) => CronScheduleDraft,
  ) => {
    if (triggerOptions.readonly) {
      return;
    }
    const current = store.get(draftAtom);
    const nextDraft = update(current.draft);
    store.set(draftAtom, { ...current, draft: nextDraft });
    const nextResult = getCronScheduleDraftResult(nextDraft);
    if (!isDefined(nextResult.settings)) {
      return;
    }
    triggerOptions.onTriggerUpdate({
      ...trigger,
      settings: mergeCronScheduleSettings({
        settings: trigger.settings,
        nextSettings: nextResult.settings,
      }),
    });
  };

  return (
    <>
      <WorkflowCronScheduleDraftSyncEffect
        draftAtom={draftAtom}
        settings={trigger.settings}
      />
      <WorkflowStepBody>
        <CronScheduleFields
          value={draft}
          onChange={updateDraft}
          readonly={triggerOptions.readonly}
          isDescriptionVisible={false}
        />
        <CronExpressionHelperLazy
          trigger={
            isDefined(result.settings)
              ? {
                  ...trigger,
                  settings: mergeCronScheduleSettings({
                    settings: trigger.settings,
                    nextSettings: result.settings,
                  }),
                }
              : trigger
          }
          isVisible={isDefined(result.settings)}
          isScheduleVisible={draft.interval !== 'CUSTOM'}
        />
      </WorkflowStepBody>
      {!triggerOptions.readonly && (
        <WorkflowStepFooter stepId={TRIGGER_STEP_ID} />
      )}
    </>
  );
};
