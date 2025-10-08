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

type DefaultBarChartConfig = {
  groupByFieldMetadataIdX: string;
  aggregateFieldMetadataId: string;
};

type DefaultNumberChartConfig = {
  aggregateFieldMetadataId: string;
};

const createDefaultGraphConfiguration = (
  graphType: GraphType,
  defaultConfig?: DefaultBarChartConfig | DefaultNumberChartConfig,
): WidgetConfiguration | null => {
  switch (graphType) {
    case GraphType.NUMBER:
      if (
        !isDefined(defaultConfig) ||
        !('aggregateFieldMetadataId' in defaultConfig)
      ) {
        return null;
      }
      return {
        __typename: 'NumberChartConfiguration',
        graphType: GraphType.NUMBER,
        aggregateFieldMetadataId: defaultConfig.aggregateFieldMetadataId,
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        displayDataLabel: true,
      };

    case GraphType.PIE:
      return null;

    case GraphType.BAR:
      if (
        !isDefined(defaultConfig) ||
        !('groupByFieldMetadataIdX' in defaultConfig)
      ) {
        return null;
      }
      return {
        __typename: 'BarChartConfiguration',
        graphType: GraphType.BAR,
        displayDataLabel: false,
        color: 'blue' satisfies ThemeColor,
        groupByFieldMetadataIdX: defaultConfig.groupByFieldMetadataIdX,
        aggregateFieldMetadataId: defaultConfig.aggregateFieldMetadataId,
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
  defaultConfig?:
    | {
        objectMetadataId: string;
        groupByFieldMetadataIdX: string;
        aggregateFieldMetadataId: string;
      }
    | {
        objectMetadataId: string;
        aggregateFieldMetadataId: string;
      };
};

export const createDefaultGraphWidget = ({
  id,
  pageLayoutTabId,
  title,
  graphType,
  gridPosition,
  objectMetadataId,
  defaultConfig,
}: CreateDefaultGraphWidgetParams): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    pageLayoutTabId,
    title,
    type: WidgetType.GRAPH,
    configuration: createDefaultGraphConfiguration(graphType, defaultConfig),
    gridPosition,
    objectMetadataId: defaultConfig?.objectMetadataId ?? objectMetadataId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
