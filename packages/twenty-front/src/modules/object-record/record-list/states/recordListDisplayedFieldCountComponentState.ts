import { RECORD_LIST_ROW_VISIBLE_FIELD_LIMIT } from '@/object-record/record-list/constants/RecordListRowVisibleFieldLimit';
import { RecordListComponentInstanceContext } from '@/object-record/record-list/states/contexts/RecordListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordListDisplayedFieldCountComponentState =
  createAtomComponentState<number>({
    key: 'recordListDisplayedFieldCountComponentState',
    defaultValue: RECORD_LIST_ROW_VISIBLE_FIELD_LIMIT,
    componentInstanceContext: RecordListComponentInstanceContext,
  });
