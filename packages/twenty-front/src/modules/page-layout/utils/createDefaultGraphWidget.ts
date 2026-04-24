import {
  AggregateOperations,
  AxisNameDisplay,
  BarChartLayout,
  GraphOrderBy,
  PageLayoutTabLayoutMode,
  type PageLayoutWidget,
  type PageLayoutWidgetGridPosition,
  type WidgetConfiguration,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';

const createDefaultGraphConfiguration = (
  fieldSelection?: GraphWidgetFieldSelection,
  timezone?: string,
  firstDayOfTheWeek?: number,
): WidgetConfiguration => {
  return {
    __typename: 'BarChartConfiguration',
    configurationType: WidgetConfigurationType.BAR_CHART,
    layout: BarChartLayout.VERTICAL,
    displayDataLabel: true,
    displayLegend: true,
    color: 'auto' satisfies GraphColor,
    primaryAxisGroupByFieldMetadataId:
      fieldSelection?.groupByFieldMetadataIdX ?? '',
    aggregateFieldMetadataId: fieldSelection?.aggregateFieldMetadataId ?? '',
    aggregateOperation: AggregateOperations.SUM,
    primaryAxisOrderBy: GraphOrderBy.FIELD_POSITION_ASC,
    axisNameDisplay: AxisNameDisplay.NONE,
    timezone,
    firstDayOfTheWeek,
  };
};

type CreateDefaultGraphWidgetParams = {
  id: string;
  pageLayoutTabId: string;
  title: string;
  position: Omit<PageLayoutWidgetGridPosition, '__typename' | 'layoutMode'>;
  objectMetadataId?: string | null;
  fieldSelection?: GraphWidgetFieldSelection;
  timezone?: string;
  firstDayOfTheWeek?: number;
};

export const createDefaultGraphWidget = ({
  id,
  pageLayoutTabId,
  title,
  position,
  objectMetadataId,
  fieldSelection,
  timezone,
  firstDayOfTheWeek,
}: CreateDefaultGraphWidgetParams): PageLayoutWidget => {
  const resolvedObjectMetadataId =
    fieldSelection?.objectMetadataId ?? objectMetadataId ?? null;

  const configuration = createDefaultGraphConfiguration(
    fieldSelection,
    timezone,
    firstDayOfTheWeek,
  );

  return {
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    pageLayoutTabId,
    title,
    isActive: true,
    type: WidgetType.GRAPH,
    configuration,
    position: {
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: position.row,
      column: position.column,
      rowSpan: position.rowSpan,
      columnSpan: position.columnSpan,
    },
    objectMetadataId: resolvedObjectMetadataId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
