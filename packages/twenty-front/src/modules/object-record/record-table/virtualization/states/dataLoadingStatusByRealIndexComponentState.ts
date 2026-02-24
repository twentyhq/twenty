import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const dataLoadingStatusByRealIndexComponentState =
  createComponentStateV2<Map<number, 'loaded' | 'not-loaded'>>({
    key: 'dataLoadingStatusByRealIndexComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: new Map(),
  });
