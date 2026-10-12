import { type DragEvent } from 'react';

// Native link and image drags would cancel the dnd-kit pointer drag
export const preventNativeDragStart = (event: DragEvent) => {
  event.preventDefault();
};
