import type { ReactNode } from 'react';

export type AddToNavDroppableProvided = {
  innerRef: (element: HTMLElement | null) => void;
  droppableProps: object;
  placeholder: ReactNode;
};
