import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { lazy, Suspense } from 'react';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';

type WorkflowActionLogicFunctionProps = {
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

const WorkflowEditActionLogicFunction = lazy(() =>
  import(
    '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionLogicFunction'
  ).then((module) => ({
    default: module.WorkflowEditActionLogicFunction,
  })),
);

const WorkflowReadonlyActionLogicFunction = lazy(() =>
  import(
    '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowReadonlyActionLogicFunction'
  ).then((module) => ({
    default: module.WorkflowReadonlyActionLogicFunction,
  })),
);

export const WorkflowActionLogicFunction = ({
  action,
  actionOptions,
}: WorkflowActionLogicFunctionProps) => {
  return (
    <Suspense fallback={<RightDrawerSkeletonLoader />}>
      {actionOptions.readonly ? (
        <WorkflowReadonlyActionLogicFunction action={action} />
      ) : (
        <WorkflowEditActionLogicFunction
          action={action}
          actionOptions={actionOptions}
        />
      )}
    </Suspense>
  );
};
