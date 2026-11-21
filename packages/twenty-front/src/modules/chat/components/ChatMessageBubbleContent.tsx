import { styled } from '@linaria/react';
import { type ReactNode, useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { CHAT_MESSAGE_META_SPACER_WIDTH } from '@/chat/constants/ChatMessageMetaSpacerWidth';

const META_HEIGHT = themeCssVariables.spacing[6];

const StyledContent = styled.div<{ isSpacerReservedByContent: boolean }>`
  --chat-message-meta-spacer-height: ${META_HEIGHT};
  overflow-wrap: anywhere;
  position: relative;

  &::after {
    content: '';
    display: ${({ isSpacerReservedByContent }) =>
      isSpacerReservedByContent ? 'none' : 'inline-block'};
    width: ${CHAT_MESSAGE_META_SPACER_WIDTH};
  }
`;

const StyledMeta = styled.div`
  align-items: center;
  bottom: 0;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${META_HEIGHT};
  position: absolute;
  right: 0;
`;

type ChatMessageBubbleContentProps = {
  children: ReactNode;
  meta?: ReactNode;
  // For block content that reads the spacer variables to make room itself
  isSpacerReservedByContent?: boolean;
};

export const ChatMessageBubbleContent = ({
  children,
  meta,
  isSpacerReservedByContent = false,
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
    <StyledContent isSpacerReservedByContent={isSpacerReservedByContent}>
      {children}
      <StyledMeta ref={observeMetaWidth}>{meta}</StyledMeta>
    </StyledContent>
  );
};
