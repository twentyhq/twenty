import { createContext } from 'react';

type TimelineActivityContextValue = {
  recordId: string;
};

export const TimelineActivityContext =
  createContext<TimelineActivityContextValue>({
    recordId: '',
  });
