import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const isRecordIdSecondaryDragMultipleComponentFamilyState =
  createAtomComponentFamilyState<boolean, { recordId: string }>({
    key: 'isRecordIdSecondaryDragMultipleComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordSelectionComponentInstanceContext,
  });
