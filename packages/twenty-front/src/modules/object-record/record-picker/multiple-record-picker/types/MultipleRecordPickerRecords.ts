import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';

export type MultipleRecordPickerRecords<
  CustomRecordForRecordPicker extends SingleRecordPickerRecord,
> = {
  selectedRecords: CustomRecordForRecordPicker[];
  filteredSelectedRecords: CustomRecordForRecordPicker[];
  recordsToSelect: CustomRecordForRecordPicker[];
  loading: boolean;
};
