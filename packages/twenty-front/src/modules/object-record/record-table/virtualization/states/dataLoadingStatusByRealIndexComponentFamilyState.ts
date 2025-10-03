import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const dataLoadingStatusByRealIndexComponentFamilyState =
  createComponentFamilyState<'loaded' | null, { realIndex: number | null }>({
    key: 'dataLoadingStatusByRealIndexComponentFamilyState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
