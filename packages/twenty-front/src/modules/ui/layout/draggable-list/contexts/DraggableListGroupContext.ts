import { createContext } from 'react';

export type DraggableListGroupContextValue = {
  group: string;
  itemIndexByDraggableId: Map<string, number>;
};

export const DraggableListGroupContext =
  createContext<DraggableListGroupContextValue | null>(null);
