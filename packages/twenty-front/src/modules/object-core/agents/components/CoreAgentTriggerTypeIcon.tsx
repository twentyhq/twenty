import { type AgentTrigger } from 'twenty-shared/application';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { getCoreAgentTriggerTypeLabelAndIcon } from '@/object-core/agents/utils/getCoreAgentTriggerTypeLabelAndIcon';

type CoreAgentTriggerTypeIconProps = {
  trigger: AgentTrigger;
};

export const CoreAgentTriggerTypeIcon = ({
  trigger,
}: CoreAgentTriggerTypeIconProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(getCoreAgentTriggerTypeLabelAndIcon(trigger).icon);

  return (
    <Icon
      color={trigger.type === 'CRON' ? theme.color.purple : theme.color.blue}
      size={16}
    />
  );
};
