import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { lazy, Suspense } from 'react';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';

type WorkflowActionCodeProps = {
  action: WorkflowCodeAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowCodeAction) => void;
      };
};

const WorkflowEditActionCode = lazy(() =>
  import(
    '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCode'
  ).then((module) => ({
    default: module.WorkflowEditActionCode,
  })),
);

const WorkflowReadonlyActionCode = lazy(() =>
  import(
    '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowReadonlyActionCode'
  ).then((module) => ({
    default: module.WorkflowReadonlyActionCode,
  })),
);

export const WorkflowActionCode = ({
  action,
  actionOptions,
}: WorkflowActionCodeProps) => {
  return (
    <Suspense fallback={<RightDrawerSkeletonLoader />}>
      {actionOptions.readonly ? (
        <WorkflowReadonlyActionCode action={action} />
      ) : (
        <WorkflowEditActionCode action={action} actionOptions={actionOptions} />
      )}
    </Suspense>
  );
};
