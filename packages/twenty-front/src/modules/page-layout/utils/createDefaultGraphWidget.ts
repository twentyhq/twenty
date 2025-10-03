import { assertUnreachable } from 'twenty-shared/utils';
import { type ThemeColor } from 'twenty-ui/theme';
import { v4 as uuidv4 } from 'uuid';
import { GraphOrderBy, GraphType } from '~/generated-metadata/graphql';
import {
  AxisNameDisplay,
  ExtendedAggregateOperations,
  type GridPosition,
  type PageLayoutWidget,
  type WidgetConfiguration,
  WidgetType,
} from '~/generated/graphql';

const createDefaultGraphConfiguration = (
  graphType: GraphType,
): WidgetConfiguration => {
  const placeholderFieldId1 = uuidv4();
  const placeholderFieldId2 = uuidv4();

  switch (graphType) {
    case GraphType.NUMBER:
      return {
        __typename: 'NumberChartConfiguration',
        graphType: GraphType.NUMBER,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataId: placeholderFieldId1,
        displayDataLabel: false,
      };

    case GraphType.PIE:
      return {
        __typename: 'PieChartConfiguration',
        graphType: GraphType.PIE,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataId: placeholderFieldId1,
        groupByFieldMetadataId: placeholderFieldId2,
        orderBy: GraphOrderBy.VALUE_DESC,
        displayDataLabel: false,
        color: 'blue' satisfies ThemeColor,
      };

    case GraphType.BAR:
      return {
        __typename: 'BarChartConfiguration',
        graphType: GraphType.BAR,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataId: placeholderFieldId1,
        groupByFieldMetadataIdX: placeholderFieldId2,
        orderByX: GraphOrderBy.FIELD_ASC,
        displayDataLabel: false,
        axisNameDisplay: AxisNameDisplay.BOTH,
        color: 'blue' satisfies ThemeColor,
      };

    case GraphType.LINE:
      return {
        __typename: 'LineChartConfiguration',
        graphType: GraphType.LINE,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataId: placeholderFieldId1,
        groupByFieldMetadataIdX: placeholderFieldId2,
        orderByX: GraphOrderBy.FIELD_ASC,
        displayDataLabel: false,
        axisNameDisplay: AxisNameDisplay.BOTH,
        color: 'blue' satisfies ThemeColor,
      };

    case GraphType.GAUGE:
      return {
        __typename: 'GaugeChartConfiguration',
        graphType: GraphType.GAUGE,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataId: placeholderFieldId1,
        displayDataLabel: false,
        color: 'blue' satisfies ThemeColor,
      };

    default:
      assertUnreachable(graphType);
  }
};

export const createDefaultGraphWidget = ({
  id,
  pageLayoutTabId,
  title,
  graphType,
  gridPosition,
  objectMetadataId,
}: {
  id: string;
  pageLayoutTabId: string;
  title: string;
  graphType: GraphType;
  gridPosition: GridPosition;
  objectMetadataId?: string | null;
}): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    pageLayoutTabId,
    title,
    type: WidgetType.GRAPH,
    configuration: createDefaultGraphConfiguration(graphType),
    gridPosition,
    objectMetadataId: objectMetadataId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
