import { useCoreAgentTrigger } from '@/object-core/agents/hooks/useCoreAgentTrigger';
import { coreAgentTriggerSchema } from '@/object-core/agents/validation-schemas/coreAgentTriggerSchema';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useLingui } from '@lingui/react/macro';
import { describeCronExpression } from '~/utils/cron-to-human/describeCronExpression';

type CoreAgentScheduleTriggerFieldsProps = {
  agentId: string;
  triggerId: string;
  disabled: boolean;
};

export const CoreAgentScheduleTriggerFields = ({
  agentId,
  triggerId,
  disabled,
}: CoreAgentScheduleTriggerFieldsProps) => {
  const { t } = useLingui();
  const { trigger, updateTrigger } = useCoreAgentTrigger({
    agentId,
    triggerId,
  });

  if (trigger?.type !== 'CRON') {
    return null;
  }

  const hasValidPattern =
    coreAgentTriggerSchema.options[1].shape.settings.safeParse(
      trigger.settings,
    ).success;
  const description = (() => {
    try {
      return describeCronExpression(trigger.settings.pattern, {
        use24HourTimeFormat: true,
      });
    } catch {
      return undefined;
    }
  })();

  return (
    <SettingsTextInput
      instanceId={`agent-trigger-cron-${triggerId}`}
      label={t`Cron pattern`}
      placeholder="0 9 * * 1"
      value={trigger.settings.pattern}
      onChange={(pattern) =>
        updateTrigger((current) =>
          current.type === 'CRON'
            ? { ...current, settings: { ...current.settings, pattern } }
            : current,
        )
      }
      disabled={disabled}
      fullWidth
      hint={description}
      error={
        !hasValidPattern
          ? t`Enter a valid cron pattern, such as 0 9 * * 1.`
          : undefined
      }
    />
  );
};
