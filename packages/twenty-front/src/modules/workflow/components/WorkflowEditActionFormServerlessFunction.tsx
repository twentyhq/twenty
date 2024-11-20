import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { WorkflowEditActionFormServerlessFunctionInner } from '@/workflow/components/WorkflowEditActionFormServerlessFunctionInner';
import { WorkflowCodeAction } from '@/workflow/types/Workflow';

type WorkflowEditActionFormServerlessFunctionProps = {
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

export const WorkflowEditActionFormServerlessFunction = ({
  action,
  actionOptions,
}: WorkflowEditActionFormServerlessFunctionProps) => {
  const { loading: isLoadingServerlessFunctions } =
    useGetManyServerlessFunctions();

  if (isLoadingServerlessFunctions) {
    return null;
  }

  return (
    <WorkflowEditActionFormServerlessFunctionInner
      action={action}
      actionOptions={actionOptions}
    />
  );
};
