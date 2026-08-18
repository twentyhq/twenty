import { createContext } from 'react';

export type DraggableListGroupContextValue = {
  group: string;
  registerItem: (draggableId: string, index: number) => void;
  unregisterItem: (draggableId: string) => void;
};

export const DraggableListGroupContext =
  createContext<DraggableListGroupContextValue | null>(null);
