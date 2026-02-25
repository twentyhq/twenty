import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const dataLoadingStatusByRealIndexComponentState =
  createAtomComponentState<Map<number, 'loaded' | 'not-loaded'>>({
    key: 'dataLoadingStatusByRealIndexComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: new Map(),
  });
