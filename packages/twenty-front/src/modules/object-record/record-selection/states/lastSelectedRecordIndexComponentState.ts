import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const lastSelectedRecordIndexComponentState = createAtomComponentState<
  number | null | undefined
>({
  key: 'lastSelectedRecordIndexComponentState',
  defaultValue: null,
  componentInstanceContext: RecordSelectionComponentInstanceContext,
});
