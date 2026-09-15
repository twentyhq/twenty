import { RecordListComponentInstanceContext } from '@/object-record/record-list/states/contexts/RecordListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordListHoveredFieldMetadataItemIdComponentState =
  createAtomComponentState<string | null>({
    key: 'recordListHoveredFieldMetadataItemIdComponentState',
    defaultValue: null,
    componentInstanceContext: RecordListComponentInstanceContext,
  });
