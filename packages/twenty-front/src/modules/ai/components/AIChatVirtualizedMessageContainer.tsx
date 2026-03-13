import { useEffect, useRef } from 'react';
import { useStore } from 'jotai';

import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { useProcessChatScroll } from '@/ai/hooks/useProcessChatScroll';
import { chatMessageMeasuredHeightsComponentState } from '@/ai/states/chatMessageMeasuredHeightsComponentState';
import { chatVirtualSlotComponentFamilyState } from '@/ai/states/chatVirtualSlotComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { styled } from '@linaria/react';

const StyledVirtualizedMessageContainer = styled.div<{ offsetTop: number }>`
  left: 0;
  position: absolute;
  top: ${({ offsetTop }) => offsetTop}px;
  width: 100%;
`;

type AIChatVirtualizedMessageContainerProps = {
  virtualIndex: number;
};

export const AIChatVirtualizedMessageContainer = ({
  virtualIndex,
}: AIChatVirtualizedMessageContainerProps) => {
  const chatVirtualSlot = useAtomComponentFamilyStateValue(
    chatVirtualSlotComponentFamilyState,
    virtualIndex,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const store = useStore();

  const measuredHeightsCallbackState = useAtomComponentStateCallbackState(
    chatMessageMeasuredHeightsComponentState,
  );

  const { processScroll } = useProcessChatScroll();

  const messageId = chatVirtualSlot?.messageId;

  useEffect(() => {
    const element = containerRef.current;

    if (!element || !messageId) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.borderBoxSize[0].blockSize;

        if (newHeight === 0) {
          continue;
        }

        const currentHeights = store.get(measuredHeightsCallbackState);

        if (currentHeights[messageId] !== newHeight) {
          store.set(measuredHeightsCallbackState, {
            ...currentHeights,
            [messageId]: newHeight,
          });

          processScroll();
        }
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [messageId, store, measuredHeightsCallbackState, processScroll]);

  if (!chatVirtualSlot) {
    return null;
  }

  return (
    <StyledVirtualizedMessageContainer
      ref={containerRef}
      offsetTop={chatVirtualSlot.offsetTop}
    >
      <AIChatMessage messageId={chatVirtualSlot.messageId} />
    </StyledVirtualizedMessageContainer>
  );
};
