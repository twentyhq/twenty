import { AggregateContentId } from '@/object-record/record-board/types/AggregateContentId';
import { createContext } from 'vm';

export type DropdownContextValue<T> = {
  currentContentId: T | null;
  onContentChange: (key: T) => void;
  resetContent: () => void;
};

export const DropdownContext = createContext(
  {} as DropdownContextValue<AggregateContentId>,
);
