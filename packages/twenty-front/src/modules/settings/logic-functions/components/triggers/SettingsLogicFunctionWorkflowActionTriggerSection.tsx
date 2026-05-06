import { SettingsLogicFunctionTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionTriggerSection';
import { useLingui } from '@lingui/react/macro';
import { type WorkflowActionTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

const DEFAULT_WORKFLOW_ACTION_TRIGGER_SETTINGS: WorkflowActionTriggerSettings =
  {
    inputSchema: [],
  };

type SettingsLogicFunctionWorkflowActionTriggerSectionProps = {
  value: WorkflowActionTriggerSettings | null;
  onChange: (value: WorkflowActionTriggerSettings | null) => void;
  readonly: boolean;
};

export const SettingsLogicFunctionWorkflowActionTriggerSection = ({
  value,
  onChange,
  readonly,
}: SettingsLogicFunctionWorkflowActionTriggerSectionProps) => {
  const { t } = useLingui();

  return (
    <SettingsLogicFunctionTriggerSection
      title={t`Workflow action`}
      description={t`Exposes the function as a step in the workflow builder`}
      enabled={isDefined(value)}
      onEnabledChange={(checked) =>
        onChange(checked ? DEFAULT_WORKFLOW_ACTION_TRIGGER_SETTINGS : null)
      }
      readonly={readonly}
    />
  );
};
