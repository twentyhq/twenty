import { useUpdateSidePanelPageInfo } from '@/side-panel/hooks/useUpdateSidePanelPageInfo';
import { useSidePanelWorkflowIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { sidePanelWorkflowStepIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowStepIdComponentState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { getAgentIdFromStep } from '@/workflow/utils/getAgentIdFromStep';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { useUpdateAgentLabel } from '@/workflow/workflow-steps/hooks/useUpdateAgentLabel';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { getTriggerIconColor } from '@/workflow/workflow-trigger/utils/getTriggerIconColor';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import { CoreObjectNameSingular, SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';
import { SidePanelPageInfoLayout } from './SidePanelPageInfoLayout';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const SidePanelWorkflowStepInfo = ({
  sidePanelPageInstanceId,
}: {
  sidePanelPageInstanceId: string;
}) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const sidePanelPage = useAtomStateValue(sidePanelPageState);

  const workflowId = useSidePanelWorkflowIdOrThrow();

  const sidePanelWorkflowStepId = useAtomComponentStateValue(
    sidePanelWorkflowStepIdComponentState,
    sidePanelPageInstanceId,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const isReadonly =
    sidePanelPage === SidePanelPages.WorkflowStepView ||
    sidePanelPage === SidePanelPages.WorkflowRunStepView;

  const { updateSidePanelPageInfo } = useUpdateSidePanelPageInfo();

  const instanceId = getWorkflowVisualizerComponentInstanceId({
    recordId: workflowId,
  });
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);

  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();
  const { updateOneRecord: updateOneWorkflowVersion } = useUpdateOneRecord();

  const {
    trigger,
    steps,
    id: workflowVersionId,
  } = workflowWithCurrentVersion?.currentVersion ?? {
    trigger: null,
    steps: null,
    id: undefined,
  };

  const isTriggerStep = sidePanelWorkflowStepId === TRIGGER_STEP_ID;

  const stepDefinition =
    isDefined(sidePanelWorkflowStepId) && isDefined(trigger)
      ? isTriggerStep || isDefined(steps)
        ? getStepDefinitionOrThrow({
            stepId: sidePanelWorkflowStepId,
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
    !isDefined(sidePanelWorkflowStepId) ||
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
    ? getTriggerIconColor(stepDefinition.definition.type)
    : getActionIconColorOrThrow(stepDefinition.definition.type);

  const headerType = isTrigger ? t`Trigger` : t`Action`;

  const Icon = getIcon(headerIcon ?? 'IconDefault');

  const saveTitle = async () => {
    if (!isDefined(workflowVersionId) || !isDefined(workflowId)) {
      return;
    }

    updateSidePanelPageInfo({
      pageTitle: title,
      pageIcon: Icon,
    });

    const targetWorkflowVersionId = await getUpdatableWorkflowVersion();

    if (isTrigger) {
      await updateOneWorkflowVersion({
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
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
    <SidePanelPageInfoLayout
      icon={
        headerIcon ? (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        ) : undefined
      }
      iconColor={headerIconColor}
      title={
        <TitleInput
          instanceId={`workflow-step-title-${sidePanelPageInstanceId}`}
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
