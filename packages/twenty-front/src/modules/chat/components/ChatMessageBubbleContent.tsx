import { styled } from '@linaria/react';
import { type ReactNode, useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { CHAT_MESSAGE_META_SPACER_WIDTH } from '@/chat/constants/ChatMessageMetaSpacerWidth';

const StyledContent = styled.div`
  overflow-wrap: anywhere;
  position: relative;

  &::after,
  & .markdown-section > :last-child::after {
    content: '';
    display: inline-block;
    width: ${CHAT_MESSAGE_META_SPACER_WIDTH};
  }

  &:has(.markdown-section)::after {
    content: none;
  }
`;

const StyledMeta = styled.div`
  align-items: center;
  bottom: 0;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  position: absolute;
  right: 0;
`;

type ChatMessageBubbleContentProps = {
  children: ReactNode;
  meta?: ReactNode;
};

export const ChatMessageBubbleContent = ({
  children,
  meta,
}: ChatMessageBubbleContentProps) => {
  const observeMetaWidth = useCallback((metaElement: HTMLDivElement | null) => {
    const contentElement = metaElement?.parentElement;

    if (!isDefined(metaElement) || !isDefined(contentElement)) {
      return;
    }

    const updateSpacerWidth = () => {
      contentElement.style.setProperty(
        '--chat-message-meta-spacer-width',
        `calc(${metaElement.offsetWidth}px + ${themeCssVariables.spacing[2]})`,
      );
    };

    updateSpacerWidth();

    const resizeObserver = new ResizeObserver(updateSpacerWidth);

    resizeObserver.observe(metaElement);

    return () => resizeObserver.disconnect();
  }, []);

  if (!isDefined(meta)) {
    return children;
  }

  return (
    <StyledContent>
      {children}
      <StyledMeta ref={observeMetaWidth}>{meta}</StyledMeta>
    </StyledContent>
  );
};
