import { type KeyboardEvent } from 'react';

export const getTableRowActivationKeyDownHandler =
  (onActivate: () => void) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onActivate();
  };
