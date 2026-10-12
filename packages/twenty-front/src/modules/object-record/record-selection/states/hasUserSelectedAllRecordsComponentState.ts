import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const hasUserSelectedAllRecordsComponentState =
  createAtomComponentState<boolean>({
    key: 'hasUserSelectedAllRecordsComponentState',
    defaultValue: false,
    componentInstanceContext: RecordSelectionComponentInstanceContext,
  });
