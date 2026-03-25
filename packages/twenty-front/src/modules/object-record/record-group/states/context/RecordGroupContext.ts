import { createContext } from 'react';

export type RecordGroupContextProps = {
  recordGroupId: string;
};

export const RecordGroupContext = createContext<RecordGroupContextProps>(
  {} as RecordGroupContextProps,
);
