import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { lazy, Suspense } from 'react';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';

type WorkflowActionServerlessFunctionProps = {
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

const WorkflowEditActionServerlessFunction = lazy(() =>
  import(
    '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionServerlessFunction'
  ).then((module) => ({
    default: module.WorkflowEditActionServerlessFunction,
  })),
);

const WorkflowReadonlyActionServerlessFunction = lazy(() =>
  import(
    '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowReadonlyActionServerlessFunction'
  ).then((module) => ({
    default: module.WorkflowReadonlyActionServerlessFunction,
  })),
);

export const WorkflowActionServerlessFunction = ({
  action,
  actionOptions,
}: WorkflowActionServerlessFunctionProps) => {
  return (
    <Suspense fallback={<RightDrawerSkeletonLoader />}>
      {actionOptions.readonly ? (
        <WorkflowReadonlyActionServerlessFunction action={action} />
      ) : (
        <WorkflowEditActionServerlessFunction
          action={action}
          actionOptions={actionOptions}
        />
      )}
    </Suspense>
  );
};
