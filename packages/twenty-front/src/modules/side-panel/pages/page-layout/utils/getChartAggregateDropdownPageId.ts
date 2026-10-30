const CHART_AGGREGATE_DROPDOWN_PAGE_PREFIX = {
  operations: 'aggregate-operations',
  ratio: 'aggregate-ratio',
};

export const getChartAggregateDropdownPageId = ({
  fieldMetadataId,
  page,
}: {
  fieldMetadataId: string;
  page: keyof typeof CHART_AGGREGATE_DROPDOWN_PAGE_PREFIX;
}) => `${CHART_AGGREGATE_DROPDOWN_PAGE_PREFIX[page]}-${fieldMetadataId}`;
