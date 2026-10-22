import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const numberOfPendingPageFetchesComponentState =
  createAtomComponentState<number>({
    key: 'numberOfPendingPageFetchesComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: 0,
  });
