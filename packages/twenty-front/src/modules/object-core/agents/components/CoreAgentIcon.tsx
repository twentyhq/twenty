import { isDefined } from 'twenty-shared/utils';

import { AiAgentAvatar } from '@/ai/components/AiAgentAvatar';
import { getCoreAgentAvatarColor } from '@/object-core/agents/utils/getCoreAgentAvatarColor';

type CoreAgentIconProps = {
  agentId?: string;
  size: number;
};

export const CoreAgentIcon = ({ agentId, size }: CoreAgentIconProps) => (
  <AiAgentAvatar
    color={isDefined(agentId) ? getCoreAgentAvatarColor(agentId) : 'blue'}
    size={size}
  />
);
