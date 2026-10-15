import { TintedIconTile } from 'twenty-ui/components/data-display';
import { IconSparkles } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { AGENT_CHAT_ASSISTANT_COLOR } from '@/ai/constants/AgentChatAssistantColor';

export const AiChatAssistantAvatar = () => {
  const theme = useTheme();

  return (
    <TintedIconTile
      icon={<IconSparkles size={theme.icon.size.sm} />}
      color={AGENT_CHAT_ASSISTANT_COLOR}
    />
  );
};
