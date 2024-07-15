import { createEventContext } from '~/utils/createEventContext';

export type RecordIndexEventContextProps = {
  onIndexIdentifierClick: (recordId: string) => void;
};

export const RecordIndexEventContext =
  createEventContext<RecordIndexEventContextProps>();
