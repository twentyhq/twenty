import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { type WorkflowCronScheduleDraftState } from '@/workflow/workflow-trigger/types/WorkflowCronScheduleDraftState';
import { reconcileWorkflowCronScheduleDraft } from '@/workflow/workflow-trigger/utils/reconcileWorkflowCronScheduleDraft';
import { type PrimitiveAtom, useStore } from 'jotai';
import { useEffect } from 'react';

type WorkflowCronScheduleDraftSyncEffectProps = {
  draftAtom: PrimitiveAtom<WorkflowCronScheduleDraftState>;
  settings: WorkflowCronTrigger['settings'];
};

export const WorkflowCronScheduleDraftSyncEffect = ({
  draftAtom,
  settings,
}: WorkflowCronScheduleDraftSyncEffectProps) => {
  const store = useStore();
  useEffect(() => {
    const current = store.get(draftAtom);
    if (current.sourceSettings === settings) {
      return;
    }
    store.set(
      draftAtom,
      reconcileWorkflowCronScheduleDraft({ current, settings }),
    );
  }, [draftAtom, settings, store]);
  return null;
};
