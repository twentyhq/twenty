export const getChartFiltersSettingsInstanceId = ({
  widgetId,
  objectMetadataItemId,
}: {
  widgetId: string;
  objectMetadataItemId: string;
}) => {
  const instanceId = `chart-filters-widget-${widgetId}-${objectMetadataItemId}`;

  return {
    instanceId,
  };
};
