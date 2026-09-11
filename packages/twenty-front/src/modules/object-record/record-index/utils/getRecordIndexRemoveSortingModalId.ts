import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';

export const getRecordIndexRemoveSortingModalId = (recordIndexId: string) =>
  `${RECORD_INDEX_REMOVE_SORTING_MODAL_ID}-${recordIndexId}`;
