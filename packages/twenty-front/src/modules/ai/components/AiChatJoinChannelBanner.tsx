import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useAiChatThreadById } from '@/ai/hooks/useAiChatThreadById';
import { useChatChannelActions } from '@/ai/hooks/useChatChannelActions';
import { useChatChannels } from '@/ai/hooks/useChatChannels';

const StyledBanner = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledText = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

type AiChatJoinChannelBannerProps = {
  threadId: string;
};

export const AiChatJoinChannelBanner = ({
  threadId,
}: AiChatJoinChannelBannerProps) => {
  const { t } = useLingui();
  const thread = useAiChatThreadById(threadId);
  const { findChannelById } = useChatChannels();
  const { joinChatChannel } = useChatChannelActions();
  const channel = findChannelById(thread?.channelId);

  if (!isDefined(channel)) {
    return null;
  }

  return (
    <StyledBanner>
      <StyledText>{t`Join ${channel.name} to write in this conversation`}</StyledText>
      <Button
        title={t`Join channel`}
        variant="solid"
        color="accent"
        size="sm"
        onClick={() => joinChatChannel(channel.id)}
      >{t`Join channel`}</Button>
    </StyledBanner>
  );
};
