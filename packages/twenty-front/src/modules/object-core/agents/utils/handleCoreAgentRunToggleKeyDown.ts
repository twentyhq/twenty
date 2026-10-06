import { type KeyboardEvent } from 'react';

export const handleCoreAgentRunToggleKeyDown =
  (onToggle: () => void) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onToggle();
  };
