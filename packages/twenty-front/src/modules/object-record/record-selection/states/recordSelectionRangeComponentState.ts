import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Shift+click selects from the anchor and drops what the previous shift+click
// added, so the records a range added are kept apart from the ones selected
// before it
export const recordSelectionRangeComponentState = createAtomComponentState<{
  anchorRecordId: string;
  addedRecordIds: string[];
} | null>({
  key: 'recordSelectionRangeComponentState',
  defaultValue: null,
  componentInstanceContext: RecordSelectionComponentInstanceContext,
});
