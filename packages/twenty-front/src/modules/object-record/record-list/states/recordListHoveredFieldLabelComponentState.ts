import { RecordListComponentInstanceContext } from '@/object-record/record-list/states/contexts/RecordListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordListHoveredFieldLabelComponentState =
  createAtomComponentState<string>({
    key: 'recordListHoveredFieldLabelComponentState',
    defaultValue: '',
    componentInstanceContext: RecordListComponentInstanceContext,
  });
