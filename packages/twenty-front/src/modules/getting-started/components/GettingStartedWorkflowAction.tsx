import { GettingStartedWorkflowPreview } from '@/getting-started/components/GettingStartedWorkflowPreview';
import { useOpenGettingStartedWorkflow } from '@/getting-started/hooks/useOpenGettingStartedWorkflow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

const StyledColumn = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

type GettingStartedWorkflowActionProps = {
  stepActionKey: GettingStartedStepActionKey;
};

export const GettingStartedWorkflowAction = ({
  stepActionKey,
}: GettingStartedWorkflowActionProps) => {
  const { t } = useLingui();
  const { openGettingStartedWorkflow, isOpeningWorkflow } =
    useOpenGettingStartedWorkflow(stepActionKey);

  return (
    <StyledColumn>
      <GettingStartedWorkflowPreview stepActionKey={stepActionKey} />
      <Button
        variant="solid"
        color="accent"
        loading={isOpeningWorkflow}
        onClick={() => void openGettingStartedWorkflow()}
      >
        {t`Set up the workflow`}
      </Button>
    </StyledColumn>
  );
};
