import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { DEFAULT_VIEW_GROUP_LOAD_LIMIT } from 'twenty-shared/constants';

// Kept in view state rather than refs, since the load limit menu can remount mid-save
export const recordIndexGroupLoadLimitSaveComponentState =
  createAtomComponentState<{
    latestRequestId: number;
    pendingRequestCount: number;
    savedGroupLoadLimit: number;
  }>({
    key: 'recordIndexGroupLoadLimitSaveComponentState',
    defaultValue: {
      latestRequestId: 0,
      pendingRequestCount: 0,
      savedGroupLoadLimit: DEFAULT_VIEW_GROUP_LOAD_LIMIT,
    },
    componentInstanceContext: ViewComponentInstanceContext,
  });
