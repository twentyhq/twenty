import { createContext } from 'react';

type TimelineActivityContextValue = {
  labelIdentifierValue: string;
};

export const TimelineActivityContext =
  createContext<TimelineActivityContextValue>({
    labelIdentifierValue: '',
  });
