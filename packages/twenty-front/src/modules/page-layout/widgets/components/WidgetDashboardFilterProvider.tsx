import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { WidgetDashboardFilterContext } from '@/page-layout/contexts/WidgetDashboardFilterContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { computeDashboardFilterForWidget } from '@/page-layout/utils/computeDashboardFilterForWidget';
import { getPageLayoutWidgetFilter } from '@/page-layout/utils/getPageLayoutWidgetFilter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsByIdMapSelector } from '@/views/states/selectors/viewsByIdMapSelector';
import { type ReactNode, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type WidgetDashboardFilterProviderProps = {
  widget: Pick<PageLayoutWidget, 'id' | 'objectMetadataId' | 'configuration'>;
  dashboardFilters: DashboardFilters;
  children: ReactNode;
};

export const WidgetDashboardFilterProvider = ({
  widget,
  dashboardFilters,
  children,
}: WidgetDashboardFilterProviderProps) => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );
  const viewsByIdMap = useAtomStateValue(viewsByIdMapSelector);
  const recordTableWidgetViewDraft = useAtomComponentStateValue(
    recordTableWidgetViewDraftComponentState,
    currentPageLayout.id,
  );
  const { filterValueDependencies } = useFilterValueDependencies();

  const fields = isDefined(widget.objectMetadataId)
    ? objectMetadataItemsByIdMap.get(widget.objectMetadataId)?.fields
    : undefined;

  const widgetDashboardFilter = useMemo(
    () =>
      computeDashboardFilterForWidget({
        dashboardFilters,
        configuration: widget.configuration,
        fields: fields ?? [],
        // Out of edit mode the table shows its saved view, so drafts are ignored
        widgetFilter: getPageLayoutWidgetFilter({
          widget,
          viewsById: viewsByIdMap,
          recordTableWidgetViewDrafts: isPageLayoutInEditMode
            ? recordTableWidgetViewDraft
            : {},
        }),
        filterValueDependencies,
      }),
    [
      dashboardFilters,
      widget,
      fields,
      viewsByIdMap,
      isPageLayoutInEditMode,
      recordTableWidgetViewDraft,
      filterValueDependencies,
    ],
  );

  return (
    <WidgetDashboardFilterContext.Provider value={widgetDashboardFilter}>
      {children}
    </WidgetDashboardFilterContext.Provider>
  );
};
