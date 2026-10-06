import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type DashboardFilterSlotDefinitionsAndBindings } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotDefinitionsAndBindings';
import { computeBuiltInDashboardFilterSlotsAndBindings } from '@/page-layout/dashboard-filters/utils/computeBuiltInDashboardFilterSlotsAndBindings';
import { computePersistedDashboardFilterSlotsAndBindings } from '@/page-layout/dashboard-filters/utils/computePersistedDashboardFilterSlotsAndBindings';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

const NO_SLOTS_AND_BINDINGS: DashboardFilterSlotDefinitionsAndBindings = {
  slotDefinitions: [],
  bindingsByWidgetId: {},
};

// Computed once per dashboard rather than once per chip, card and chart hook: the draft changes on every drag in edit mode.
export const dashboardFilterSlotsComponentSelector =
  createAtomComponentSelector<DashboardFilterSlotDefinitionsAndBindings>({
    key: 'dashboardFilterSlotsComponentSelector',
    componentInstanceContext: PageLayoutComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        // Mirrors useCurrentPageLayout: dashboards keep edit mode in component state, which a selector can read; record pages do not, but they never have slots.
        const isDashboardInEditMode = get(isDashboardInEditModeComponentState, {
          instanceId,
        });
        const pageLayoutDraft = get(pageLayoutDraftComponentState, {
          instanceId,
        });
        const pageLayoutPersisted = get(pageLayoutPersistedComponentState, {
          instanceId,
        });

        const currentPageLayout =
          isDashboardInEditMode && isNonEmptyString(pageLayoutDraft.id)
            ? pageLayoutDraft
            : pageLayoutPersisted;

        if (currentPageLayout?.type !== PageLayoutType.DASHBOARD) {
          return NO_SLOTS_AND_BINDINGS;
        }

        const widgets = currentPageLayout.tabs.flatMap((tab) => tab.widgets);

        // Once a dashboard persists its own slots, even an empty list, the built-ins no longer apply to it.
        if (isDefined(currentPageLayout.dashboardFilters)) {
          return computePersistedDashboardFilterSlotsAndBindings({
            slots: currentPageLayout.dashboardFilters,
            widgets,
          });
        }

        return computeBuiltInDashboardFilterSlotsAndBindings({
          widgets,
          objectMetadataItems: get(objectMetadataItemsWithFieldsSelector),
        });
      },
  });
