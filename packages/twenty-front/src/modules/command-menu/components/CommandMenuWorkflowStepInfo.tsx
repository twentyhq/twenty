import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { commandMenuWorkflowIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowIdComponentState';
import { commandMenuWorkflowStepIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowStepIdComponentState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { getAgentIdFromStep } from '@/workflow/utils/getAgentIdFromStep';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { useUpdateAgentLabel } from '@/workflow/workflow-steps/hooks/useUpdateAgentLabel';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { getTriggerIconColor } from '@/workflow/workflow-trigger/utils/getTriggerIconColor';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';

const StyledWorkflowStepInfoContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledWorkflowStepIcon = styled.div<{ iconColor: string }>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ iconColor }) => iconColor};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledWorkflowStepTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  min-width: 0;
`;

const StyledWorkflowStepType = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  white-space: nowrap;
`;

export const CommandMenuWorkflowStepInfo = ({
  commandMenuPageInstanceId,
}: {
  commandMenuPageInstanceId: string;
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const workflowId = useRecoilComponentValue(
    commandMenuWorkflowIdComponentState,
    commandMenuPageInstanceId,
  );

  const workflowStepId = useRecoilComponentValue(
    commandMenuWorkflowStepIdComponentState,
    commandMenuPageInstanceId,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const isReadonly =
    commandMenuPage === CommandMenuPages.WorkflowStepView ||
    commandMenuPage === CommandMenuPages.WorkflowRunStepView;

  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();
  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const {
    trigger,
    steps,
    id: workflowVersionId,
  } = workflowWithCurrentVersion?.currentVersion ?? {
    trigger: null,
    steps: null,
    id: undefined,
  };

  const isTriggerStep = workflowStepId === TRIGGER_STEP_ID;

  const stepDefinition =
    isDefined(workflowStepId) && isDefined(trigger)
      ? isTriggerStep || isDefined(steps)
        ? getStepDefinitionOrThrow({
            stepId: workflowStepId,
            trigger,
            steps,
          })
        : undefined
      : undefined;

  const isTrigger = stepDefinition?.type === 'trigger';

  const agentId = getAgentIdFromStep(stepDefinition);
  const { updateAgentLabel } = useUpdateAgentLabel(agentId);
  const stepName =
    isDefined(stepDefinition) && isDefined(stepDefinition.definition)
      ? isTrigger
        ? (stepDefinition.definition.name ??
          (stepDefinition.definition.type === 'MANUAL'
            ? 'Launch manually'
            : 'Trigger'))
        : (stepDefinition.definition.name ?? 'Action')
      : '';

  const [editedTitle, setEditedTitle] = useState<string | null>(null);

  const title =
    editedTitle ?? (isDefined(stepName) && stepName !== '' ? stepName : '');

  const handleTitleChange = (newTitle: string) => {
    setEditedTitle(newTitle);
  };

  if (
    !isDefined(workflowId) ||
    !isDefined(workflowStepId) ||
    !isDefined(workflowWithCurrentVersion?.currentVersion) ||
    !isDefined(stepDefinition) ||
    !isDefined(stepDefinition.definition)
  ) {
    return null;
  }

  const headerIcon = isTrigger
    ? getTriggerIcon(stepDefinition.definition)
    : getActionIcon(stepDefinition.definition.type);

  const headerIconColor = isTrigger
    ? getTriggerIconColor({
        theme,
        triggerType: stepDefinition.definition.type,
      })
    : getActionIconColorOrThrow({
        theme,
        actionType: stepDefinition.definition.type,
      });

  const headerType = isTrigger ? 'Trigger' : 'Action';

  const Icon = getIcon(headerIcon ?? 'IconDefault');

  const saveTitle = async () => {
    if (!isDefined(workflowVersionId)) {
      return;
    }

    updateCommandMenuPageInfo({
      pageTitle: title,
      pageIcon: Icon,
    });

    if (isTrigger) {
      await updateOneWorkflowVersion({
        idToUpdate: workflowVersionId,
        updateOneRecordInput: {
          trigger: {
            ...stepDefinition.definition,
            name: title,
          } as typeof stepDefinition.definition,
        },
      });
    } else {
      await updateWorkflowVersionStep({
        workflowVersionId,
        step: {
          ...stepDefinition.definition,
          name: title,
        },
      });

      if (isDefined(agentId)) {
        await updateAgentLabel(title);
      }
    }
  };

  return (
    <StyledWorkflowStepInfoContainer>
      {headerIcon && (
        <StyledWorkflowStepIcon iconColor={headerIconColor}>
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        </StyledWorkflowStepIcon>
      )}
      <StyledWorkflowStepTitleContainer>
        <TitleInput
          instanceId={`workflow-step-title-${commandMenuPageInstanceId}`}
          disabled={isReadonly}
          sizeVariant="sm"
          value={title}
          onChange={handleTitleChange}
          placeholder={headerType}
          onEnter={saveTitle}
          onEscape={() => setEditedTitle(null)}
          onClickOutside={saveTitle}
          onTab={saveTitle}
          onShiftTab={saveTitle}
        />
      </StyledWorkflowStepTitleContainer>
      <StyledWorkflowStepType>
        {isTrigger ? t`Trigger` : t`Action`}
      </StyledWorkflowStepType>
    </StyledWorkflowStepInfoContainer>
  );
};
