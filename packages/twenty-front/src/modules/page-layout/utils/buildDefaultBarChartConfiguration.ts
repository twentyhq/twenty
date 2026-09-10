import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import {
  AggregateOperations,
  AxisNameDisplay,
  type BarChartConfiguration,
  BarChartLayout,
  GraphOrderBy,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

export const buildDefaultBarChartConfiguration = ({
  fieldSelection,
  timezone,
  firstDayOfTheWeek,
}: {
  fieldSelection?: GraphWidgetFieldSelection;
  timezone?: string;
  firstDayOfTheWeek?: number;
}): BarChartConfiguration => ({
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
});
