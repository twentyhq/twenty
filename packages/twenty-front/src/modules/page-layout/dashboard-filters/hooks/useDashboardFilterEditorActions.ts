import { useDashboardFilterEditor } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterEditor';
import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { addDashboardFilterSlotToDraft } from '@/page-layout/dashboard-filters/utils/addDashboardFilterSlotToDraft';
import { buildDashboardFilterSlotFromCandidateDimension } from '@/page-layout/dashboard-filters/utils/buildDashboardFilterSlotFromCandidateDimension';
import { convertBuiltInDashboardFilterSlotsToPersistedInDraft } from '@/page-layout/dashboard-filters/utils/convertBuiltInDashboardFilterSlotsToPersistedInDraft';
import { removeDashboardFilterSlotFromDraft } from '@/page-layout/dashboard-filters/utils/removeDashboardFilterSlotFromDraft';
import { restoreBuiltInDashboardFiltersInDraft } from '@/page-layout/dashboard-filters/utils/restoreBuiltInDashboardFiltersInDraft';
import { setWidgetDashboardFilterBindingInDraft } from '@/page-layout/dashboard-filters/utils/setWidgetDashboardFilterBindingInDraft';
import { updateDashboardFilterSlotInDraft } from '@/page-layout/dashboard-filters/utils/updateDashboardFilterSlotInDraft';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';

export const useDashboardFilterEditorActions = (pageLayoutId: string) => {
  const pageLayoutDraftCallbackState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const {
    isUsingBuiltInFilters,
    slots: builtInSlots,
    bindingsByWidgetId: builtInBindingsByWidgetId,
  } = useDashboardFilterEditor(pageLayoutId);

  // Going custom first freezes the built-ins as real slots, so the bar keeps showing them after the edit.
  const convertBuiltInFiltersIfNeeded = () => {
    if (!isUsingBuiltInFilters) {
      return;
    }

    store.set(pageLayoutDraftCallbackState, (draft) =>
      convertBuiltInDashboardFilterSlotsToPersistedInDraft({
        draft,
        builtInSlots,
        builtInBindingsByWidgetId,
      }),
    );
  };

  // Returns the id of the slot the dimension now stands for, so the caller can open it.
  const addCandidateDimension = (
    dimension: DashboardFilterCandidateDimension,
  ): string => {
    convertBuiltInFiltersIfNeeded();

    if (dimension.isBuiltIn === true) {
      return dimension.id;
    }

    const { slot, bindingsByWidgetId } =
      buildDashboardFilterSlotFromCandidateDimension(dimension);

    store.set(pageLayoutDraftCallbackState, (draft) =>
      addDashboardFilterSlotToDraft({ draft, slot, bindingsByWidgetId }),
    );

    return slot.id;
  };

  const updateSlot = (
    slotId: string,
    slotUpdate: Partial<Omit<DashboardFilterSlot, 'id'>>,
  ) => {
    store.set(pageLayoutDraftCallbackState, (draft) =>
      updateDashboardFilterSlotInDraft({ draft, slotId, slotUpdate }),
    );
  };

  const removeSlot = (slotId: string) => {
    store.set(pageLayoutDraftCallbackState, (draft) =>
      removeDashboardFilterSlotFromDraft({ draft, slotId }),
    );
  };

  const setWidgetBinding = ({
    widgetId,
    slotId,
    binding,
  }: {
    widgetId: string;
    slotId: string;
    binding: DashboardFilterBinding | null;
  }) => {
    store.set(pageLayoutDraftCallbackState, (draft) =>
      setWidgetDashboardFilterBindingInDraft({
        draft,
        widgetId,
        slotId,
        binding,
      }),
    );
  };

  const restoreBuiltInFilters = () => {
    store.set(
      pageLayoutDraftCallbackState,
      restoreBuiltInDashboardFiltersInDraft,
    );
  };

  return {
    addCandidateDimension,
    updateSlot,
    removeSlot,
    setWidgetBinding,
    restoreBuiltInFilters,
  };
};
