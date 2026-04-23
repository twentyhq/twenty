import { GRAPH_CONFIGURATION_TYPES } from 'src/engine/metadata-modules/page-layout-widget/constants/graph-configuration-types.constant';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { type ChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/chart-referencing-field-in-configuration.type';

export const isChartReferencingFieldInConfiguration = (
  configuration: AllPageLayoutWidgetConfiguration,
): configuration is ChartReferencingFieldInConfiguration =>
  GRAPH_CONFIGURATION_TYPES.has(configuration.configurationType);
