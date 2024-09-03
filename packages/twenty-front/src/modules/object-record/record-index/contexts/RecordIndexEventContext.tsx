import { createEventContext } from '@/ui/utilities/state/instance/utils/createEventContext';

export type RecordIndexEventContextProps = {
  onIndexIdentifierClick: (recordId: string) => void;
  onIndexRecordsLoaded: () => void;
};

export const RecordIndexEventContext =
  createEventContext<RecordIndexEventContextProps>();
