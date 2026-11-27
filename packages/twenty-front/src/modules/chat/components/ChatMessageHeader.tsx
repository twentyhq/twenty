import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { ChatMessageTime } from '@/chat/components/ChatMessageTime';
import { CHAT_MESSAGE_HEADER_BOTTOM_MARGIN } from '@/chat/constants/ChatMessageHeaderBottomMargin';
import { CHAT_MESSAGE_HEADER_HEIGHT } from '@/chat/constants/ChatMessageHeaderHeight';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${CHAT_MESSAGE_HEADER_HEIGHT};
  margin-bottom: ${CHAT_MESSAGE_HEADER_BOTTOM_MARGIN};
  min-width: 0;
`;

const StyledAuthor = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledTime = styled.span`
  flex-shrink: 0;
`;

type ChatMessageHeaderProps = {
  avatar: ReactNode;
  name: string;
  createdAt?: Date | string;
};

export const ChatMessageHeader = ({
  avatar,
  name,
  createdAt,
}: ChatMessageHeaderProps) => {
  return (
    <StyledHeader>
      {avatar}
      <StyledAuthor>
        <Text
          render={<span />}
          size="md"
          color="primary"
          weight="semibold"
          truncate
        >
          {name}
        </Text>
        {isDefined(createdAt) && (
          <StyledTime>
            <ChatMessageTime date={createdAt} />
          </StyledTime>
        )}
      </StyledAuthor>
    </StyledHeader>
  );
};
