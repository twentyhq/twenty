import { RECORD_GROUP_REORDER_CONFIRMATION_MODAL_ID } from '@/object-record/record-group/constants/RecordGroupReorderConfirmationModalId';

export const getRecordGroupReorderConfirmationModalId = (
  recordIndexId: string,
) => `${RECORD_GROUP_REORDER_CONFIRMATION_MODAL_ID}-${recordIndexId}`;
