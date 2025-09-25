import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { GraphType } from '@/page-layout/mocks/mockWidgets';
import { GraphOrderBy } from '@/page-layout/widgets/graph/types/GraphOrderBy';
import { type GraphWidget } from '@/page-layout/widgets/graph/types/GraphWidget';
import { type GraphWidgetConfiguration } from '@/page-layout/widgets/graph/types/GraphWidgetConfiguration';
import { type GridPosition, WidgetType } from '~/generated/graphql';

const createDefaultGraphConfiguration = (
  graphType: GraphType,
): GraphWidgetConfiguration => {
  switch (graphType) {
    case GraphType.NUMBER:
      return {
        graphType: GraphType.NUMBER,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: 'id',
      };

    case GraphType.PIE:
      return {
        graphType: GraphType.PIE,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: 'id',
        groupByFieldMetadataId: 'createdAt',
        orderBy: GraphOrderBy.VALUE_DESC,
      };

    case GraphType.BAR:
      return {
        graphType: GraphType.BAR,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: 'id',
        groupByFieldMetadataIdX: 'createdAt',
        orderByX: GraphOrderBy.FIELD_ASC,
      };

    case GraphType.LINE:
      return {
        graphType: GraphType.LINE,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: 'id',
        groupByFieldMetadataIdX: 'createdAt',
        orderByX: GraphOrderBy.FIELD_ASC,
      };

    case GraphType.GAUGE:
      return {
        graphType: GraphType.GAUGE,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: 'id',
        aggregateOperationTotal: AggregateOperations.COUNT,
        aggregateFieldMetadataIdTotal: 'id',
      };

    default:
      return {
        graphType: GraphType.NUMBER,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: 'id',
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
): GraphWidget => {
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
