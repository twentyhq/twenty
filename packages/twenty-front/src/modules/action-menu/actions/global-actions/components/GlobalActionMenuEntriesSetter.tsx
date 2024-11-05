import { WorkflowRunActionEffect } from '@/action-menu/actions/global-actions/workflow-run-actions/components/WorkflowRunActionEffect';

const globalActionEffects = [WorkflowRunActionEffect];

export const GlobalActionMenuEntriesSetter = () => {
  return (
    <>
      {globalActionEffects.map((ActionEffect, index) => (
        <ActionEffect key={index} />
      ))}
    </>
  );
};
