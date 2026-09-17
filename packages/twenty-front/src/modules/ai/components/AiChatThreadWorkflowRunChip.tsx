import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconSettingsAutomation } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledChip = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type AiChatThreadWorkflowRunChipProps = {
  workflowRunId: string | null | undefined;
};

// A thread opened by a workflow AI agent step links back to its run.
export const AiChatThreadWorkflowRunChip = ({
  workflowRunId,
}: AiChatThreadWorkflowRunChipProps) => {
  const { t } = useLingui();
  const navigateApp = useNavigateApp();

  if (!isDefined(workflowRunId)) {
    return null;
  }

  return (
    <StyledChip
      type="button"
      title={t`Open the workflow run`}
      onClick={() =>
        navigateApp(AppPath.RecordShowPage, {
          objectNameSingular: CoreObjectNameSingular.WorkflowRun,
          objectRecordId: workflowRunId,
        })
      }
    >
      <IconSettingsAutomation size={12} />
      {t`Workflow run`}
    </StyledChip>
  );
};
