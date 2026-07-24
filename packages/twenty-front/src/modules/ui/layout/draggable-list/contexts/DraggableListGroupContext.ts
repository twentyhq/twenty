import { createContext, type RefObject } from 'react';

export type DraggableListGroupContextValue = {
  group: string;
  itemIndexByDraggableIdRef: RefObject<Map<string, number>>;
};

export const DraggableListGroupContext =
  createContext<DraggableListGroupContextValue | null>(null);
