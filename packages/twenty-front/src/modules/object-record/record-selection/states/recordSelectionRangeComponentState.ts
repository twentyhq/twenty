import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Shift+click selects from the anchor to the clicked record and drops the
// records the previous shift+click added, so the last end is kept as the lead
export const recordSelectionRangeComponentState = createAtomComponentState<{
  anchorRecordId: string;
  leadRecordId: string;
} | null>({
  key: 'recordSelectionRangeComponentState',
  defaultValue: null,
  componentInstanceContext: RecordSelectionComponentInstanceContext,
});
