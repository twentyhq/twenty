import { useCallback } from 'react';
import { useStore } from 'jotai';

import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { DEFAULT_CHAT_MESSAGE_ESTIMATED_HEIGHT } from '@/ai/constants/DefaultChatMessageEstimatedHeight';
import { NUMBER_OF_VIRTUALIZED_CHAT_MESSAGES } from '@/ai/constants/NumberOfVirtualizedChatMessages';
import { chatMessageMeasuredHeightsComponentState } from '@/ai/states/chatMessageMeasuredHeightsComponentState';
import { chatTotalHeightComponentState } from '@/ai/states/chatTotalHeightComponentState';
import { chatVirtualSlotComponentFamilyState } from '@/ai/states/chatVirtualSlotComponentFamilyState';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';

const OVERSCAN_COUNT = 2;

export const useProcessChatScroll = () => {
  const store = useStore();

  const messagesCallbackState = useAtomComponentStateCallbackState(
    agentChatMessagesComponentState,
  );

  const measuredHeightsCallbackState = useAtomComponentStateCallbackState(
    chatMessageMeasuredHeightsComponentState,
  );

  const virtualSlotFamilyCallbackState =
    useAtomComponentFamilyStateCallbackState(
      chatVirtualSlotComponentFamilyState,
    );

  const totalHeightCallbackState = useAtomComponentStateCallbackState(
    chatTotalHeightComponentState,
  );

  const processScroll = useCallback(() => {
    const scrollWrapperElement = document.getElementById(
      `scroll-wrapper-${AI_CHAT_SCROLL_WRAPPER_ID}`,
    );

    if (!scrollWrapperElement) {
      return;
    }

    const messages = store.get(messagesCallbackState);
    const measuredHeights = store.get(measuredHeightsCallbackState);
    const scrollTop = scrollWrapperElement.scrollTop;
    const viewportHeight = scrollWrapperElement.clientHeight;

    if (messages.length === 0) {
      for (
        let virtualIndex = 0;
        virtualIndex < NUMBER_OF_VIRTUALIZED_CHAT_MESSAGES;
        virtualIndex++
      ) {
        const currentSlot = store.get(
          virtualSlotFamilyCallbackState(virtualIndex),
        );

        if (currentSlot !== null) {
          store.set(virtualSlotFamilyCallbackState(virtualIndex), null);
        }
      }

      const currentTotalHeight = store.get(totalHeightCallbackState);

      if (currentTotalHeight !== 0) {
        store.set(totalHeightCallbackState, 0);
      }

      return;
    }

    const offsets: number[] = [];
    const heights: number[] = [];
    let cumulativeOffset = 0;

    for (const message of messages) {
      offsets.push(cumulativeOffset);
      const height =
        measuredHeights[message.id] ?? DEFAULT_CHAT_MESSAGE_ESTIMATED_HEIGHT;
      heights.push(height);
      cumulativeOffset += height;
    }

    const totalHeight = cumulativeOffset;

    const currentTotalHeight = store.get(totalHeightCallbackState);

    if (currentTotalHeight !== totalHeight) {
      store.set(totalHeightCallbackState, totalHeight);
    }

    let firstVisibleIndex = 0;

    for (let i = 0; i < messages.length; i++) {
      if (offsets[i] + heights[i] > scrollTop) {
        firstVisibleIndex = i;
        break;
      }

      if (i === messages.length - 1) {
        firstVisibleIndex = i;
      }
    }

    let lastVisibleIndex = firstVisibleIndex;

    for (let i = firstVisibleIndex; i < messages.length; i++) {
      lastVisibleIndex = i;

      if (offsets[i] >= scrollTop + viewportHeight) {
        break;
      }
    }

    const startIndex = Math.max(0, firstVisibleIndex - OVERSCAN_COUNT);
    const endIndex = Math.min(
      messages.length - 1,
      lastVisibleIndex + OVERSCAN_COUNT,
    );

    for (
      let virtualIndex = 0;
      virtualIndex < NUMBER_OF_VIRTUALIZED_CHAT_MESSAGES;
      virtualIndex++
    ) {
      const realIndex = startIndex + virtualIndex;
      const currentSlot = store.get(
        virtualSlotFamilyCallbackState(virtualIndex),
      );

      if (realIndex <= endIndex && realIndex < messages.length) {
        const newSlot = {
          messageId: messages[realIndex].id,
          offsetTop: offsets[realIndex],
        };

        if (
          currentSlot?.messageId !== newSlot.messageId ||
          currentSlot?.offsetTop !== newSlot.offsetTop
        ) {
          store.set(virtualSlotFamilyCallbackState(virtualIndex), newSlot);
        }
      } else {
        if (currentSlot !== null) {
          store.set(virtualSlotFamilyCallbackState(virtualIndex), null);
        }
      }
    }
  }, [
    store,
    messagesCallbackState,
    measuredHeightsCallbackState,
    virtualSlotFamilyCallbackState,
    totalHeightCallbackState,
  ]);

  return { processScroll };
};
