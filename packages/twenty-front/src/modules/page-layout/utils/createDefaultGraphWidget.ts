import { v4 as uuidv4 } from 'uuid';
import { GraphOrderBy, GraphType } from '~/generated-metadata/graphql';
import {
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
        graphType: GraphType.NUMBER,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataId: placeholderFieldId1,
        displayDataLabel: false,
      };

    case GraphType.PIE:
      return {
        graphType: GraphType.PIE,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataId: placeholderFieldId1,
        groupByFieldMetadataId: placeholderFieldId2,
        orderBy: GraphOrderBy.VALUE_DESC,
        displayDataLabel: false,
      };

    case GraphType.BAR:
      return {
        graphType: GraphType.BAR,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataId: placeholderFieldId1,
        groupByFieldMetadataIdX: placeholderFieldId2,
        orderByX: GraphOrderBy.FIELD_ASC,
        displayDataLabel: false,
      };

    case GraphType.LINE:
      return {
        graphType: GraphType.LINE,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataId: placeholderFieldId1,
        groupByFieldMetadataIdX: placeholderFieldId2,
        orderByX: GraphOrderBy.FIELD_ASC,
        displayDataLabel: false,
      };

    case GraphType.GAUGE:
      return {
        graphType: GraphType.GAUGE,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataId: placeholderFieldId1,
        aggregateOperationTotal: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataIdTotal: placeholderFieldId2,
        displayDataLabel: false,
      };

    default:
      return {
        graphType: GraphType.NUMBER,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        aggregateFieldMetadataId: placeholderFieldId1,
        displayDataLabel: false,
      };
  }
};

export const createDefaultGraphWidget = (
  id: string,
  pageLayoutTabId: string,
  title: string,
  graphType: GraphType,
  gridPosition: GridPosition,
  objectMetadataId?: string | null,
): PageLayoutWidget => {
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
