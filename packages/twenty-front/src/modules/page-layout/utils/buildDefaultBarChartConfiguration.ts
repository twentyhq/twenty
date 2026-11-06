import { type CompleteGraphWidgetFieldSelection } from '@/page-layout/types/CompleteGraphWidgetFieldSelection';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import {
  AxisNameDisplay,
  type BarChartConfiguration,
  BarChartLayout,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

export const buildDefaultBarChartConfiguration = ({
  fieldSelection,
  timezone,
  firstDayOfTheWeek,
}: {
  fieldSelection: CompleteGraphWidgetFieldSelection;
  timezone?: string;
  firstDayOfTheWeek?: number;
}): BarChartConfiguration => ({
  __typename: 'BarChartConfiguration',
  configurationType: WidgetConfigurationType.BAR_CHART,
  layout: BarChartLayout.VERTICAL,
  displayDataLabel: true,
  displayLegend: true,
  color: 'auto' satisfies GraphColor,
  primaryAxisGroupByFieldMetadataId: fieldSelection.groupByFieldMetadataId,
  aggregateFieldMetadataId: fieldSelection.aggregateFieldMetadataId,
  aggregateOperation: fieldSelection.aggregateOperation,
  primaryAxisOrderBy: fieldSelection.groupByOrderBy,
  axisNameDisplay: AxisNameDisplay.NONE,
  timezone,
  firstDayOfTheWeek,
});
