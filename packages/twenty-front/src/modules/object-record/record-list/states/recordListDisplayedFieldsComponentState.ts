import { RECORD_LIST_ROW_FIELD_MAX_WIDTH } from '@/object-record/record-list/constants/RecordListRowFieldMaxWidth';
import { RECORD_LIST_ROW_VISIBLE_FIELD_LIMIT } from '@/object-record/record-list/constants/RecordListRowVisibleFieldLimit';
import { RecordListComponentInstanceContext } from '@/object-record/record-list/states/contexts/RecordListComponentInstanceContext';
import { type RecordListDisplayedFields } from '@/object-record/record-list/types/RecordListDisplayedFields';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

const DEFAULT_RECORD_LIST_DISPLAYED_FIELDS: RecordListDisplayedFields = {
  displayedFieldCount: RECORD_LIST_ROW_VISIBLE_FIELD_LIMIT,
  displayedFieldMaxWidth: RECORD_LIST_ROW_FIELD_MAX_WIDTH,
};

export const recordListDisplayedFieldsComponentState =
  createAtomComponentState<RecordListDisplayedFields>({
    key: 'recordListDisplayedFieldsComponentState',
    defaultValue: DEFAULT_RECORD_LIST_DISPLAYED_FIELDS,
    componentInstanceContext: RecordListComponentInstanceContext,
  });
