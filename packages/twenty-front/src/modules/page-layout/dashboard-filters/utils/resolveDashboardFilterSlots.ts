import {
  type ComputeBuiltInBindingsArgs,
  computeBuiltInBindings,
} from '@/page-layout/dashboard-filters/utils/computeBuiltInBindings';
import { computePersistedDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/computePersistedDashboardFilterBindings';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

export type ResolvedDashboardFilterSlots = {
  slots: DashboardFilterSlot[];
  bindingsByWidgetId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >;
  isUsingBuiltInSlots: boolean;
};

const EMPTY_RESULT: ResolvedDashboardFilterSlots = {
  slots: [],
  bindingsByWidgetId: {},
  isUsingBuiltInSlots: false,
};

// Shared by the runtime hook (current layout) and the editor hooks (draft by id) so both see the same slots.
export const resolveDashboardFilterSlots = ({
  pageLayout,
  objectMetadataItems,
  builtInSlots,
}: {
  pageLayout:
    | Pick<PageLayout, 'type' | 'tabs' | 'dashboardFilters'>
    | null
    | undefined;
  objectMetadataItems: ComputeBuiltInBindingsArgs['objectMetadataItems'];
  builtInSlots: DashboardFilterSlot[];
}): ResolvedDashboardFilterSlots => {
  if (!isDefined(pageLayout) || pageLayout.type !== PageLayoutType.DASHBOARD) {
    return EMPTY_RESULT;
  }

  const widgets = pageLayout.tabs.flatMap((tab) => tab.widgets);

  // null means the dashboard was never configured, so the built-ins apply
  const persistedSlots = pageLayout.dashboardFilters as
    | DashboardFilterSlot[]
    | null
    | undefined;

  if (isDefined(persistedSlots)) {
    return {
      slots: persistedSlots,
      bindingsByWidgetId: computePersistedDashboardFilterBindings({ widgets }),
      isUsingBuiltInSlots: false,
    };
  }

  return {
    slots: builtInSlots,
    bindingsByWidgetId: computeBuiltInBindings({
      widgets,
      objectMetadataItems,
    }),
    isUsingBuiltInSlots: true,
  };
};
