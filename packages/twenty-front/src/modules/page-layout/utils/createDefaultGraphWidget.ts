import { type ThemeColor } from 'twenty-ui/theme';
import {
  AggregateOperations,
  AxisNameDisplay,
  BarChartLayout,
  GraphOrderBy,
  type GridPosition,
  type PageLayoutWidget,
  type WidgetConfiguration,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated/graphql';

import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';

const createDefaultGraphConfiguration = (
  fieldSelection?: GraphWidgetFieldSelection,
  timezone?: string,
  firstDayOfTheWeek?: number,
): WidgetConfiguration => {
  return {
    __typename: 'BarChartConfiguration',
    configurationType: WidgetConfigurationType.BAR_CHART,
    layout: BarChartLayout.VERTICAL,
    displayDataLabel: false,
    color: 'blue' satisfies ThemeColor,
    primaryAxisGroupByFieldMetadataId: fieldSelection?.groupByFieldMetadataIdX,
    aggregateFieldMetadataId: fieldSelection?.aggregateFieldMetadataId,
    aggregateOperation: AggregateOperations.SUM,
    primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
    axisNameDisplay: AxisNameDisplay.NONE,
    timezone,
    firstDayOfTheWeek,
  };
};

type CreateDefaultGraphWidgetParams = {
  id: string;
  pageLayoutTabId: string;
  title: string;
  gridPosition: GridPosition;
  objectMetadataId?: string | null;
  fieldSelection?: GraphWidgetFieldSelection;
  timezone?: string;
  firstDayOfTheWeek?: number;
};

export const createDefaultGraphWidget = ({
  id,
  pageLayoutTabId,
  title,
  gridPosition,
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
    pageLayoutTabId,
    title,
    type: WidgetType.GRAPH,
    configuration,
    gridPosition,
    objectMetadataId: resolvedObjectMetadataId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
