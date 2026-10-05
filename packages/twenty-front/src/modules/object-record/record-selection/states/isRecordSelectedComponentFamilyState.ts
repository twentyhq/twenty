import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const isRecordSelectedComponentFamilyState =
  createAtomComponentFamilyState<boolean, string>({
    key: 'isRecordSelectedComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordSelectionComponentInstanceContext,
  });
