export type DashboardFilterWidgetFilter = {
  recordFilters: {
    id?: string;
    fieldMetadataId: string;
    operand: string;
    value?: string | null;
    recordFilterGroupId?: string | null;
  }[];
  recordFilterGroups: {
    id: string;
    logicalOperator: string;
    parentRecordFilterGroupId?: string | null;
  }[];
};
