import { useCallback } from 'react';

import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useSeeDeletedRecordsNoSelectionRecordAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const currentViewId = useRecoilComponentValueV2(
      contextStoreCurrentViewIdComponentState,
    );

    if (!currentViewId) {
      throw new Error('Current view ID is not defined');
    }

    const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
      objectMetadataItem.namePlural,
      currentViewId,
    );

    const { handleToggleTrashColumnFilter, toggleSoftDeleteFilterState } =
      useHandleToggleTrashColumnFilter({
        objectNameSingular: objectMetadataItem.nameSingular,
        viewBarId: recordIndexId,
      });

    const onClick = useCallback(() => {
      handleToggleTrashColumnFilter();
      toggleSoftDeleteFilterState(true);
    }, [handleToggleTrashColumnFilter, toggleSoftDeleteFilterState]);

    return {
      shouldBeRegistered: true,
      onClick,
    };
  };
