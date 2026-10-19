import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  IconArrowDown,
  IconCheckbox,
  IconMail,
  IconTarget,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import {
  GettingStartedStep,
  PrepareGettingStartedHandoverDocument,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledColumn = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledWorkflowPreview = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

export const GettingStartedHandoverAction = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigateApp = useNavigateApp();
  const { enqueueToast } = useToast();
  const { progress, refetch } = useGettingStartedProgress();
  const [prepareGettingStartedHandover, { loading }] = useMutation(
    PrepareGettingStartedHandoverDocument,
  );
  const isWorkflowEnabled =
    progress?.completedSteps.includes(GettingStartedStep.HANDOVER_DEALS) ??
    false;

  const prepareHandover = async ({ activate }: { activate: boolean }) => {
    try {
      const { data } = await prepareGettingStartedHandover({
        variables: { activate },
      });

      if (!isDefined(data)) {
        return;
      }

      if (activate) {
        await refetch();

        return;
      }

      navigateApp(AppPath.WorkflowCoreShowPage, {
        coreWorkflowId: data.prepareGettingStartedHandover.workflowId,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <StyledColumn>
      <StyledWorkflowPreview>
        <StyledRow>
          <IconTarget size={theme.icon.size.md} />
          {t`A deal is won`}
        </StyledRow>
        <IconArrowDown size={theme.icon.size.sm} />
        <StyledRow>
          <IconCheckbox size={theme.icon.size.md} />
          {t`Create kickoff task`}
        </StyledRow>
        <IconArrowDown size={theme.icon.size.sm} />
        <StyledRow>
          <IconMail size={theme.icon.size.md} />
          {t`Email account owner`}
        </StyledRow>
      </StyledWorkflowPreview>
      <StyledRow>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          loading={loading}
          disabled={isWorkflowEnabled}
          onClick={() => void prepareHandover({ activate: true })}
        >{t`Turn on workflow`}</Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => void prepareHandover({ activate: false })}
        >{t`Edit draft`}</Button>
      </StyledRow>
    </StyledColumn>
  );
};
