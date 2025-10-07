import { assertUnreachable } from 'twenty-shared/utils';
import { type ThemeColor } from 'twenty-ui/theme';
import { GraphType } from '~/generated-metadata/graphql';
import {
  type GridPosition,
  type PageLayoutWidget,
  type WidgetConfiguration,
  WidgetType,
} from '~/generated/graphql';

const createDefaultGraphConfiguration = (
  graphType: GraphType,
): WidgetConfiguration => {
  switch (graphType) {
    case GraphType.NUMBER:
      return {
        __typename: 'NumberChartConfiguration',
        graphType: GraphType.NUMBER,
        displayDataLabel: false,
      };

    case GraphType.PIE:
      return {
        __typename: 'PieChartConfiguration',
        graphType: GraphType.PIE,
        displayDataLabel: false,
        color: 'blue' satisfies ThemeColor,
      };

    case GraphType.BAR:
      return {
        __typename: 'BarChartConfiguration',
        graphType: GraphType.BAR,
        displayDataLabel: false,
        color: 'blue' satisfies ThemeColor,
      };

    case GraphType.LINE:
      return {
        __typename: 'LineChartConfiguration',
        graphType: GraphType.LINE,
        displayDataLabel: false,
        color: 'blue' satisfies ThemeColor,
      };

    case GraphType.GAUGE:
      return {
        __typename: 'GaugeChartConfiguration',
        graphType: GraphType.GAUGE,
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
