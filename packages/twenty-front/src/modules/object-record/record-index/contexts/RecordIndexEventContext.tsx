import { createEventContext } from '~/utils/createEventContext';

export type RecordIndexEventContextProps = {
  onIdentifierChipClick: (recordId: string) => void;
};

export const RecordIndexEventContext =
  createEventContext<RecordIndexEventContextProps>();
