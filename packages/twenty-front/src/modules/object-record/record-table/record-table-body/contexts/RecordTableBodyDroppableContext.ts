import { type ReactNode } from 'react';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordTableBodyDroppableContextValue = {
  droppablePlaceholder: ReactNode;
};

export const [
  RecordTableBodyDroppableContextProvider,
  useRecordTableBodyDroppableContextOrThrow,
] = createRequiredContext<RecordTableBodyDroppableContextValue>(
  'RecordTableBodyDroppableContext',
);
