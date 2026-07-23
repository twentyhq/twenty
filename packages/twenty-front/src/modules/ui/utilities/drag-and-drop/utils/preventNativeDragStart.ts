import { type DragEvent } from 'react';

// Links and images inside draggable items are natively draggable, which lets
// the browser start a URL drag that cancels the dnd-kit pointer drag.
export const preventNativeDragStart = (event: DragEvent) => {
  event.preventDefault();
};
