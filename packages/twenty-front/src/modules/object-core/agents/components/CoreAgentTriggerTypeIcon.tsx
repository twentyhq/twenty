import { type AgentTrigger } from 'twenty-shared/application';
import { useIcons } from 'twenty-ui/icon';

import { getCoreAgentTriggerTypeLabelAndIcon } from '@/object-core/agents/utils/getCoreAgentTriggerTypeLabelAndIcon';
import { getTriggerIconColor } from '@/workflow/workflow-trigger/utils/getTriggerIconColor';

type CoreAgentTriggerTypeIconProps = {
  trigger: AgentTrigger;
};

export const CoreAgentTriggerTypeIcon = ({
  trigger,
}: CoreAgentTriggerTypeIconProps) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(getCoreAgentTriggerTypeLabelAndIcon(trigger).icon);

  return <Icon color={getTriggerIconColor(trigger.type)} size={16} />;
};
