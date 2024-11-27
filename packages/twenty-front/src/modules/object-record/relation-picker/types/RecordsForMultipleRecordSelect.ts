import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';

export type RecordsForMultipleRecordSelect<
  CustomRecordForSelect extends RecordForSelect,
> = {
  selectedEntities: CustomRecordForSelect[];
  filteredSelectedRecords: CustomRecordForSelect[];
  recordsToSelect: CustomRecordForSelect[];
  loading: boolean;
};
