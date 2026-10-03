import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { TOGGLE_MINE_RECORD_FILTER_ID } from '@/views/constants/ToggleMineRecordFilterId';
import { useToggleMineFilter } from '@/views/hooks/useToggleMineFilter';
import { isToggleMineSelectedPerViewState } from '@/views/states/isToggleMineSelectedPerViewState';
import { toggleMineFilterPerViewState } from '@/views/states/toggleMineFilterPerViewState';
import { buildToggleMineRecordFilter } from '@/views/utils/buildToggleMineRecordFilter';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type ToggleMineFilterEffectProps = {
  viewBarId: string;
  objectNameSingular: string;
};

// View loads and "Reset" rebuild the record filters from the view, so the toggle filter is re-applied here
export const ToggleMineFilterEffect = ({
  viewBarId,
  objectNameSingular,
}: ToggleMineFilterEffectProps) => {
  const store = useStore();

  const {
    viewId,
    currentRecordFilters,
    toggleMineFilterFieldMetadataItem,
    isToggleMineFilterBlocked,
    isMineSelected,
    isMineSelectionInitialized,
  } = useToggleMineFilter({ viewBarId, objectNameSingular });

  const setIsToggleMineSelectedPerView = useSetAtomState(
    isToggleMineSelectedPerViewState,
  );

  const setToggleMineFilterPerView = useSetAtomState(
    toggleMineFilterPerViewState,
  );

  const { upsertRecordFilter } = useUpsertRecordFilter(viewBarId);
  const { removeRecordFilter } = useRemoveRecordFilter(viewBarId);

  useEffect(() => {
    if (isDefined(viewId) && !isMineSelectionInitialized) {
      // Plain read, not a subscription: another window's choice must not flip this one
      const isMineSelectedInLastChoice =
        store.get(toggleMineFilterPerViewState.atom)[viewId] === true;

      setIsToggleMineSelectedPerView((previous) => ({
        ...previous,
        [viewId]: isMineSelectedInLastChoice,
      }));

      return;
    }

    if (isDefined(viewId) && isMineSelected && isToggleMineFilterBlocked) {
      setIsToggleMineSelectedPerView((previous) => ({
        ...previous,
        [viewId]: false,
      }));

      // Keeps the stored last choice in line, else a reload shows Mine for one render
      setToggleMineFilterPerView((previous) => ({
        ...previous,
        [viewId]: false,
      }));

      return;
    }

    const toggleMineRecordFilter = currentRecordFilters.find(
      (recordFilter) => recordFilter.id === TOGGLE_MINE_RECORD_FILTER_ID,
    );

    if (isMineSelected && isDefined(toggleMineFilterFieldMetadataItem)) {
      if (
        toggleMineRecordFilter?.fieldMetadataId !==
        toggleMineFilterFieldMetadataItem.id
      ) {
        upsertRecordFilter(
          buildToggleMineRecordFilter(toggleMineFilterFieldMetadataItem),
        );
      }

      return;
    }

    if (isDefined(toggleMineRecordFilter)) {
      removeRecordFilter({ recordFilterId: TOGGLE_MINE_RECORD_FILTER_ID });
    }
  }, [
    viewId,
    currentRecordFilters,
    toggleMineFilterFieldMetadataItem,
    isToggleMineFilterBlocked,
    isMineSelected,
    isMineSelectionInitialized,
    setIsToggleMineSelectedPerView,
    setToggleMineFilterPerView,
    store,
    upsertRecordFilter,
    removeRecordFilter,
  ]);

  return null;
};
