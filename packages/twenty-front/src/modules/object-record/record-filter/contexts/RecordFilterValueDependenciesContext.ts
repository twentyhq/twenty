import { createContext } from 'react';

export type RecordFilterValueDependenciesContextValue = {
  currentRecordId?: string;
};

export const RecordFilterValueDependenciesContext =
  createContext<RecordFilterValueDependenciesContextValue>({});
