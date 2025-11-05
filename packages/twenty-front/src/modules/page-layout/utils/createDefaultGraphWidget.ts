import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { type ThemeColor } from 'twenty-ui/theme';
import {
  AggregateOperations,
  AxisNameDisplay,
  GraphOrderBy,
  GraphType,
  type GridPosition,
  type PageLayoutWidget,
  type WidgetConfiguration,
  WidgetType,
} from '~/generated/graphql';

import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';

const createDefaultGraphConfiguration = (
  graphType: GraphType,
  fieldSelection?: GraphWidgetFieldSelection,
  timezone?: string,
  firstDayOfTheWeek?: number,
): WidgetConfiguration | null => {
  switch (graphType) {
    case GraphType.AGGREGATE:
      if (!isDefined(fieldSelection?.aggregateFieldMetadataId)) {
        return null;
      }
      return {
        __typename: 'AggregateChartConfiguration',
        graphType: GraphType.AGGREGATE,
        aggregateFieldMetadataId: fieldSelection.aggregateFieldMetadataId,
        aggregateOperation: AggregateOperations.COUNT,
        displayDataLabel: true,
        timezone,
        firstDayOfTheWeek,
      };

    case GraphType.PIE:
      return null;

    case GraphType.VERTICAL_BAR:
      if (
        !isDefined(fieldSelection?.aggregateFieldMetadataId) ||
        !isDefined(fieldSelection?.groupByFieldMetadataIdX)
      ) {
        return null;
      }
      return {
        __typename: 'BarChartConfiguration',
        graphType: GraphType.VERTICAL_BAR,
        displayDataLabel: false,
        color: 'blue' satisfies ThemeColor,
        primaryAxisGroupByFieldMetadataId:
          fieldSelection.groupByFieldMetadataIdX,
        aggregateFieldMetadataId: fieldSelection.aggregateFieldMetadataId,
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
        timezone,
        firstDayOfTheWeek,
      };

    case GraphType.HORIZONTAL_BAR:
      if (
        !isDefined(fieldSelection?.aggregateFieldMetadataId) ||
        !isDefined(fieldSelection?.groupByFieldMetadataIdX)
      ) {
        return null;
      }
      return {
        __typename: 'BarChartConfiguration',
        graphType: GraphType.HORIZONTAL_BAR,
        displayDataLabel: false,
        color: 'blue' satisfies ThemeColor,
        primaryAxisGroupByFieldMetadataId:
          fieldSelection.groupByFieldMetadataIdX,
        aggregateFieldMetadataId: fieldSelection.aggregateFieldMetadataId,
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
        timezone,
        firstDayOfTheWeek,
      };

    case GraphType.LINE:
      return null;

    case GraphType.GAUGE:
      return null;

    default:
      assertUnreachable(graphType);
  }
};

type CreateDefaultGraphWidgetParams = {
  id: string;
  pageLayoutTabId: string;
  title: string;
  graphType: GraphType;
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
  graphType,
  gridPosition,
  objectMetadataId,
  fieldSelection,
  timezone,
  firstDayOfTheWeek,
}: CreateDefaultGraphWidgetParams): PageLayoutWidget => {
  const resolvedObjectMetadataId =
    fieldSelection?.objectMetadataId ?? objectMetadataId ?? null;

  const configuration = createDefaultGraphConfiguration(
    graphType,
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
