import { CoreAgentDatabaseTriggerFields } from '@/object-core/agents/components/CoreAgentDatabaseTriggerFields';
import { CoreAgentScheduleTriggerFields } from '@/object-core/agents/components/CoreAgentScheduleTriggerFields';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useCoreAgentTrigger } from '@/object-core/agents/hooks/useCoreAgentTrigger';
import { TextArea } from '@/ui/input/components/TextArea';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { SettingsRow } from 'twenty-ui/components/settings';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

type CoreAgentTriggerEditorProps = {
  agentId: string;
  triggerId: string;
};

export const CoreAgentTriggerEditor = ({
  agentId,
  triggerId,
}: CoreAgentTriggerEditorProps) => {
  const { t } = useLingui();
  const { trigger, updateTrigger } = useCoreAgentTrigger({
    agentId,
    triggerId,
  });
  const { isEditable, resetVersion } = useCoreAgentEditStatus({
    agentId,
  });
  const disabled = !isEditable;

  if (!isDefined(trigger)) {
    return (
      <Text color="secondary">{t`This trigger was removed or is unsupported by this version.`}</Text>
    );
  }

  return (
    <StyledFields key={`${triggerId}-${resetVersion}`}>
      <SettingsRow
        checked={trigger.isActive}
        onCheckedChange={(isActive) =>
          updateTrigger((current) => ({ ...current, isActive }))
        }
        disabled={disabled}
        description={t`Paused triggers keep their configuration without running.`}
      >{t`Active`}</SettingsRow>
      {trigger.type === 'CRON' ? (
        <CoreAgentScheduleTriggerFields
          agentId={agentId}
          triggerId={triggerId}
          disabled={disabled}
        />
      ) : (
        <CoreAgentDatabaseTriggerFields
          agentId={agentId}
          triggerId={triggerId}
          disabled={disabled}
        />
      )}
      <TextArea
        textAreaId={`agent-trigger-instructions-${triggerId}`}
        label={t`Instructions`}
        placeholder={t`What should the agent do when this trigger fires?`}
        minRows={2}
        maxRows={8}
        value={trigger.instructions ?? ''}
        disabled={disabled}
        onChange={(instructions) =>
          updateTrigger((current) => ({
            ...current,
            instructions: isNonEmptyString(instructions.trim())
              ? instructions
              : null,
          }))
        }
      />
    </StyledFields>
  );
};
