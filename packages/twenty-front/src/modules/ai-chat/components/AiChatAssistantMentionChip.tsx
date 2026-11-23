import { Chip } from 'twenty-ui/primitives/data-display';

import { AiChatAssistantAvatar } from '@/ai-chat/components/AiChatAssistantAvatar';
import { useAiChatAssistantProfile } from '@/ai-chat/hooks/useAiChatAssistantProfile';

export const AiChatAssistantMentionChip = () => {
  const { displayName } = useAiChatAssistantProfile();

  return (
    <Chip variant="soft" startElement={<AiChatAssistantAvatar size={14} />}>
      {`@${displayName}`}
    </Chip>
  );
};
