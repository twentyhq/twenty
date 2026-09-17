import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { useNavigateToAiChatChannelPage } from '@/ai/hooks/useNavigateToAiChatChannelPage';
import { getAiChatChannelIcon } from '@/ai/utils/getAiChatChannelIcon';

const StyledChip = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type AiChatThreadChannelChipProps = {
  channelId: string | null | undefined;
};

export const AiChatThreadChannelChip = ({
  channelId,
}: AiChatThreadChannelChipProps) => {
  const { findChannelById } = useChatChannels();
  const { navigateToAiChatChannelPage } = useNavigateToAiChatChannelPage();
  const channel = findChannelById(channelId);

  if (!isDefined(channel)) {
    return null;
  }

  const Icon = getAiChatChannelIcon(channel.visibility);

  return (
    <StyledChip
      type="button"
      title={channel.name}
      onClick={() => navigateToAiChatChannelPage(channel.id)}
    >
      <Icon size={12} />
      {channel.name}
    </StyledChip>
  );
};
