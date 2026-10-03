import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordSelectionRangeComponentState = createAtomComponentState<{
  anchorRecordId: string;
  addedRecordIds: string[];
} | null>({
  key: 'recordSelectionRangeComponentState',
  defaultValue: null,
  componentInstanceContext: RecordSelectionComponentInstanceContext,
});
