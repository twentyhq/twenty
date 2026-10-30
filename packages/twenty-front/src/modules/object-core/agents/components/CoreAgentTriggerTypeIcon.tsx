import { type AgentTrigger } from 'twenty-shared/application';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { getCoreAgentTriggerTypeInfo } from '@/object-core/agents/utils/getCoreAgentTriggerTypeInfo';

type CoreAgentTriggerTypeIconProps = {
  trigger: AgentTrigger;
};

export const CoreAgentTriggerTypeIcon = ({
  trigger,
}: CoreAgentTriggerTypeIconProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(getCoreAgentTriggerTypeInfo(trigger).icon);

  return (
    <Icon
      color={trigger.type === 'CRON' ? theme.color.purple : theme.color.blue}
      size={16}
    />
  );
};
