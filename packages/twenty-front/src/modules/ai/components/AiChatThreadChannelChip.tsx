import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { getAiChatChannelIcon } from '@/ai/utils/getAiChatChannelIcon';

const StyledChip = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
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
  const channel = findChannelById(channelId);

  if (!isDefined(channel)) {
    return null;
  }

  const Icon = getAiChatChannelIcon(channel.visibility);

  return (
    <StyledChip title={channel.name}>
      <Icon size={12} />
      {channel.name}
    </StyledChip>
  );
};
