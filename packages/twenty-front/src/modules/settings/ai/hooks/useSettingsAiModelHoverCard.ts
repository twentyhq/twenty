import { type KeyboardEvent, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const useSettingsAiModelHoverCard = () => {
  const [activeHoverCard, setActiveHoverCard] = useState<{
    modelId: string;
    anchorId: string;
  } | null>(null);
  const hoverCardRef = useRef<HTMLDivElement>(null);
  const scheduleClose = useDebouncedCallback(() => {
    const focusedElement = document.activeElement;
    if (
      hoverCardRef.current?.contains(focusedElement) ||
      (activeHoverCard &&
        document.getElementById(`${activeHoverCard.anchorId}-name`) ===
          focusedElement)
    ) {
      return;
    }
    setActiveHoverCard(null);
  }, 150);
  const keepOpen = () => scheduleClose.cancel();
  const openHoverCard = (entry: { modelId: string; anchorId: string }) => {
    keepOpen();
    setActiveHoverCard(entry);
  };
  const closeHoverCard = () => {
    scheduleClose.cancel();
    setActiveHoverCard(null);
  };
  const handleHoverCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && activeHoverCard) {
      event.preventDefault();
      document.getElementById(`${activeHoverCard.anchorId}-name`)?.focus();
      closeHoverCard();
    }
  };

  return {
    activeHoverCard,
    hoverCardRef,
    openHoverCard,
    closeHoverCard,
    handleHoverCardKeyDown,
    keepOpen,
    scheduleClose,
  };
};
