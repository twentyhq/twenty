import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { WorkflowEditActionFormServerlessFunctionInner } from '@/workflow/components/WorkflowEditActionFormServerlessFunctionInner';
import { WorkflowCodeAction } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-ui';

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
  const { serverlessFunctions } = useGetManyServerlessFunctions();

  const selectedServerlessFunction = serverlessFunctions.find(
    (fn) => fn.id === action.settings.input.serverlessFunctionId,
  );

  if (!isDefined(selectedServerlessFunction)) {
    return <div>Could not find the related serverless function.</div>;
  }

  return (
    <WorkflowEditActionFormServerlessFunctionInner
      action={action}
      selectedServerlessFunction={selectedServerlessFunction}
      actionOptions={actionOptions}
    />
  );
};
