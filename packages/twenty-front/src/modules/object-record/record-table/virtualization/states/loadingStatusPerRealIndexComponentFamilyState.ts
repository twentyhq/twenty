import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export type RealIndexLoadingStatus = {
  fullyLoaded: boolean;
};

export const loadingStatusPerRealIndexComponentFamilyState =
  createComponentFamilyState<
    RealIndexLoadingStatus,
    { realIndex: number | null }
  >({
    key: 'loadingStatusPerRealIndexComponentFamilyState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: {
      fullyLoaded: false,
    },
  });
