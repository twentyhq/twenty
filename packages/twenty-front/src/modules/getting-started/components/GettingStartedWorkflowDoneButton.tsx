import { useOpenGettingStartedWorkflow } from '@/getting-started/hooks/useOpenGettingStartedWorkflow';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';
import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

type GettingStartedWorkflowDoneButtonProps = {
  stepActionKey: GettingStartedStepActionKey;
};

export const GettingStartedWorkflowDoneButton = ({
  stepActionKey,
}: GettingStartedWorkflowDoneButtonProps) => {
  const { t } = useLingui();
  const { openGettingStartedWorkflow, isOpeningWorkflow } =
    useOpenGettingStartedWorkflow(stepActionKey);

  return (
    <Button
      size="sm"
      loading={isOpeningWorkflow}
      onClick={() => void openGettingStartedWorkflow()}
    >
      {t`Go to workflow`}
    </Button>
  );
};
