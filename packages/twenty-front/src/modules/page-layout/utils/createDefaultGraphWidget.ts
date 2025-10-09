import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { type ThemeColor } from 'twenty-ui/theme';
import {
  ExtendedAggregateOperations,
  GraphOrderBy,
  GraphType,
} from '~/generated-metadata/graphql';
import {
  AxisNameDisplay,
  type GridPosition,
  type PageLayoutWidget,
  type WidgetConfiguration,
  WidgetType,
} from '~/generated/graphql';

import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';

const createDefaultGraphConfiguration = (
  graphType: GraphType,
  fieldSelection?: GraphWidgetFieldSelection,
): WidgetConfiguration | null => {
  switch (graphType) {
    case GraphType.NUMBER:
      if (!isDefined(fieldSelection?.aggregateFieldMetadataId)) {
        return null;
      }
      return {
        __typename: 'NumberChartConfiguration',
        graphType: GraphType.NUMBER,
        aggregateFieldMetadataId: fieldSelection.aggregateFieldMetadataId,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        displayDataLabel: true,
      };

    case GraphType.PIE:
      return null;

    case GraphType.BAR:
      if (
        !isDefined(fieldSelection?.aggregateFieldMetadataId) ||
        !isDefined(fieldSelection?.groupByFieldMetadataIdX)
      ) {
        return null;
      }
      return {
        __typename: 'BarChartConfiguration',
        graphType: GraphType.BAR,
        displayDataLabel: false,
        color: 'blue' satisfies ThemeColor,
        groupByFieldMetadataIdX: fieldSelection.groupByFieldMetadataIdX,
        aggregateFieldMetadataId: fieldSelection.aggregateFieldMetadataId,
        aggregateOperation: ExtendedAggregateOperations.SUM,
        orderByX: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.BOTH,
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
};

export const createDefaultGraphWidget = ({
  id,
  pageLayoutTabId,
  title,
  graphType,
  gridPosition,
  objectMetadataId,
  fieldSelection,
}: CreateDefaultGraphWidgetParams): PageLayoutWidget => {
  const resolvedObjectMetadataId =
    fieldSelection?.objectMetadataId ?? objectMetadataId ?? null;

  const configuration = createDefaultGraphConfiguration(
    graphType,
    fieldSelection,
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
