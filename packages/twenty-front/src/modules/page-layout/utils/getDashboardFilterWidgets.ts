import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type DashboardFilterWidget } from '@/page-layout/types/DashboardFilterWidget';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { getDashboardFilterWidgetCandidateFieldMetadataIds } from '@/page-layout/utils/getDashboardFilterWidgetCandidateFieldMetadataIds';
import { getPageLayoutWidgetViewFilterFieldMetadataIds } from '@/page-layout/utils/getPageLayoutWidgetViewFilterFieldMetadataIds';
import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import { getWidgetGridPosition } from '@/page-layout/utils/getWidgetGridPosition';
import { isPersistedPageLayoutWidgetReadOnly } from '@/page-layout/utils/isPersistedPageLayoutWidgetReadOnly';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';

const compareByGridPosition = (
  widgetA: PageLayoutWidget,
  widgetB: PageLayoutWidget,
) => {
  const positionA = getWidgetGridPosition(widgetA);
  const positionB = getWidgetGridPosition(widgetB);

  return (
    (positionA?.row ?? Infinity) - (positionB?.row ?? Infinity) ||
    (positionA?.column ?? Infinity) - (positionB?.column ?? Infinity)
  );
};

export const getDashboardFilterWidgets = ({
  tabs,
  persistedWidgetsById,
  objectMetadataItemsById,
  viewsById,
  recordTableWidgetViewDrafts,
  currentWorkspace,
}: {
  tabs: DraftPageLayout['tabs'];
  persistedWidgetsById: Map<string, Pick<PageLayoutWidget, 'applicationId'>>;
  objectMetadataItemsById: Map<
    string,
    Pick<EnrichedObjectMetadataItem, 'fields'>
  >;
  viewsById: Map<string, View>;
  recordTableWidgetViewDrafts: Record<string, RecordTableWidgetViewSnapshot>;
  currentWorkspace: Pick<
    CurrentWorkspace,
    'installedApplications' | 'workspaceCustomApplication'
  > | null;
}): DashboardFilterWidget[] => {
  const activeTabs = tabs
    .filter((tab) => tab.isActive)
    .sort((tabA, tabB) => tabA.position - tabB.position);

  return activeTabs.flatMap((tab) =>
    [...tab.widgets].sort(compareByGridPosition).flatMap((widget) => {
      const objectMetadataItem = isDefined(widget.objectMetadataId)
        ? objectMetadataItemsById.get(widget.objectMetadataId)
        : undefined;

      const isDataWidget =
        isWidgetConfigurationOfTypeGraph(widget.configuration) ||
        isWidgetConfigurationOfType(
          widget.configuration,
          'RecordTableConfiguration',
        );

      if (!widget.isActive || !isDataWidget || !isDefined(objectMetadataItem)) {
        return [];
      }

      return [
        {
          widgetId: widget.id,
          widgetTitle: widget.title,
          tabTitle: activeTabs.length > 1 ? tab.title : null,
          isReadOnly: isPersistedPageLayoutWidgetReadOnly({
            persistedWidget: persistedWidgetsById.get(widget.id),
            currentWorkspace,
          }),
          bindings: getWidgetDashboardFilterBindings(widget.configuration),
          candidateFieldMetadataIds:
            getDashboardFilterWidgetCandidateFieldMetadataIds({
              configuration: widget.configuration,
              viewFilterFieldMetadataIds:
                getPageLayoutWidgetViewFilterFieldMetadataIds({
                  widget,
                  viewsById,
                  recordTableWidgetViewDrafts,
                }),
            }),
          fields: objectMetadataItem.fields,
        },
      ];
    }),
  );
};
