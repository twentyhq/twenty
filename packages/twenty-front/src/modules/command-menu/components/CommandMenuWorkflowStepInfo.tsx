import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { useCommandMenuWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useCommandMenuWorkflowIdOrThrow';
import { commandMenuWorkflowStepIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowStepIdComponentState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { getAgentIdFromStep } from '@/workflow/utils/getAgentIdFromStep';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { useUpdateAgentLabel } from '@/workflow/workflow-steps/hooks/useUpdateAgentLabel';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { getTriggerIconColor } from '@/workflow/workflow-trigger/utils/getTriggerIconColor';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';
import { CommandMenuPageInfoLayout } from './CommandMenuPageInfoLayout';

export const CommandMenuWorkflowStepInfo = ({
  commandMenuPageInstanceId,
}: {
  commandMenuPageInstanceId: string;
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const workflowId = useCommandMenuWorkflowIdOrThrow();

  const workflowStepId = useRecoilComponentValue(
    commandMenuWorkflowStepIdComponentState,
    commandMenuPageInstanceId,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const isReadonly =
    commandMenuPage === CommandMenuPages.WorkflowStepView ||
    commandMenuPage === CommandMenuPages.WorkflowRunStepView;

  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();

  const instanceId = getWorkflowVisualizerComponentInstanceId({
    recordId: workflowId,
  });
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);

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
            ? t`Launch manually`
            : t`Trigger`))
        : (stepDefinition.definition.name ?? t`Action`)
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

  const headerType = isTrigger ? t`Trigger` : t`Action`;

  const Icon = getIcon(headerIcon ?? 'IconDefault');

  const saveTitle = async () => {
    if (!isDefined(workflowVersionId) || !isDefined(workflowId)) {
      return;
    }

    updateCommandMenuPageInfo({
      pageTitle: title,
      pageIcon: Icon,
    });

    const targetWorkflowVersionId = await getUpdatableWorkflowVersion();

    if (isTrigger) {
      await updateOneWorkflowVersion({
        idToUpdate: targetWorkflowVersionId,
        updateOneRecordInput: {
          trigger: {
            ...stepDefinition.definition,
            name: title,
          } as typeof stepDefinition.definition,
        },
      });
    } else {
      await updateWorkflowVersionStep({
        workflowVersionId: targetWorkflowVersionId,
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
    <CommandMenuPageInfoLayout
      icon={
        headerIcon ? (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        ) : undefined
      }
      iconColor={headerIconColor}
      title={
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
      }
      label={isTrigger ? t`Trigger` : t`Action`}
    />
  );
};
