import { useMutation } from '@apollo/client/react';
import { PREPARE_HANDOVER } from '@/getting-started/graphql/gettingStarted';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';
import {
  IconArrowDown,
  IconTarget,
  IconCheckbox,
  IconMail,
} from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/components/feedback';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useGettingStarted } from '@/getting-started/hooks/useGettingStarted';
import {
  StyledGettingStartedColumn,
  StyledGettingStartedRow,
  StyledGettingStartedBadge,
} from '@/getting-started/components/GettingStartedStyles';

export const GettingStartedHandoverAction = () => {
  const { t } = useLingui();
  const navigate = useNavigateApp();
  const { refetch, completedSteps } = useGettingStarted();
  const [prepare, { loading }] = useMutation<
    {
      prepareGettingStartedHandover: { workflowId: string; versionId: string };
    },
    { activate: boolean }
  >(PREPARE_HANDOVER);
  const { enqueueToast } = useToast();
  const run = async (activate: boolean) => {
    try {
      const result = await prepare({ variables: { activate } });
      if (!result.data) return;
      await refetch();
      if (!activate)
        navigate(AppPath.WorkflowCoreShowPage, {
          coreWorkflowId: result.data.prepareGettingStartedHandover.workflowId,
        });
    } catch (error) {
      enqueueToast({
        status: 'error',
        children:
          error instanceof Error
            ? error.message
            : t`Could not prepare the workflow.`,
      });
    }
  };
  return (
    <StyledGettingStartedColumn>
      <StyledGettingStartedBadge>
        {completedSteps.includes('handoverDeals')
          ? t`Workflow enabled`
          : t`Draft ready`}
      </StyledGettingStartedBadge>
      <StyledGettingStartedColumn style={{ alignItems: 'center', padding: 16 }}>
        <StyledGettingStartedRow>
          <IconTarget size={16} />
          {t`A deal is won`}
        </StyledGettingStartedRow>
        <IconArrowDown size={14} />
        <StyledGettingStartedRow>
          <IconCheckbox size={16} />
          {t`Create kickoff task`}
        </StyledGettingStartedRow>
        <IconArrowDown size={14} />
        <StyledGettingStartedRow>
          <IconMail size={16} />
          {t`Email account owner`}
        </StyledGettingStartedRow>
      </StyledGettingStartedColumn>
      <StyledGettingStartedRow>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          loading={loading}
          disabled={completedSteps.includes('handoverDeals')}
          onClick={() => void run(true)}
        >{t`Turn on workflow`}</Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => void run(false)}
        >{t`Edit draft`}</Button>
      </StyledGettingStartedRow>
    </StyledGettingStartedColumn>
  );
};
