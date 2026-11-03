import { type IconComponent } from 'twenty-ui/icon';

import { AiAgentAvatar } from '@/ai/components/AiAgentAvatar';

export const CoreAgentsIcon: IconComponent = ({ size = 16 }) => (
  <AiAgentAvatar color="gray" size={size} />
);
