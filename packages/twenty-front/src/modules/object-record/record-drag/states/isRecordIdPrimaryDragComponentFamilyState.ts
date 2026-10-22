import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const isRecordIdPrimaryDragComponentFamilyState =
  createAtomComponentFamilyState<boolean, { recordId: string }>({
    key: 'isRecordIdPrimaryDragComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordSelectionComponentInstanceContext,
  });
