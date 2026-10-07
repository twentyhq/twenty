import { useSetWidgetDashboardFilterBinding } from '@/page-layout/dashboard-filters/hooks/useSetWidgetDashboardFilterBinding';
import { useUpdatePageLayoutDashboardFilters } from '@/page-layout/dashboard-filters/hooks/useUpdatePageLayoutDashboardFilters';
import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { autoBindDashboardFilterSlot } from '@/page-layout/dashboard-filters/utils/autoBindDashboardFilterSlot';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export const useAddDashboardFilterSlot = (pageLayoutId: string) => {
  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const { updatePageLayoutDashboardFilters } =
    useUpdatePageLayoutDashboardFilters(pageLayoutId);

  const { setWidgetDashboardFilterBinding } =
    useSetWidgetDashboardFilterBinding(pageLayoutId);

  // Adding the first slot turns the built-in fallback off: the draft moves from null to a real list.
  const addDashboardFilterSlot = useCallback(
    (dimension: DashboardFilterCandidateDimension): DashboardFilterSlot => {
      const { slot, bindingsByWidgetId } = autoBindDashboardFilterSlot({
        dimension,
      });

      updatePageLayoutDashboardFilters((previousSlots) => [
        ...(previousSlots ?? []),
        slot,
      ]);

      const graphWidgets = store
        .get(pageLayoutDraftState)
        .tabs.flatMap((tab) => tab.widgets)
        .filter(
          (widget) =>
            widget.type === WidgetType.GRAPH &&
            isDefined(widget.objectMetadataId),
        );

      for (const widget of graphWidgets) {
        setWidgetDashboardFilterBinding({
          widgetId: widget.id,
          slotId: slot.id,
          binding: bindingsByWidgetId[widget.id] ?? null,
        });
      }

      return slot;
    },
    [
      pageLayoutDraftState,
      setWidgetDashboardFilterBinding,
      store,
      updatePageLayoutDashboardFilters,
    ],
  );

  return { addDashboardFilterSlot };
};
