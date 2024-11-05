import { WorkflowRunActionEffect } from '@/action-menu/actions/global-actions/workflow-run-actions/components/WorkflowRunActionEffect';

const globalRecordActionEffects = [WorkflowRunActionEffect];

export const GlobalActionMenuEntriesSetter = () => {
  return (
    <>
      {globalRecordActionEffects.map((ActionEffect, index) => (
        <ActionEffect key={index} />
      ))}
    </>
  );
};
