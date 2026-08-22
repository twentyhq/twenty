export type ViewFilter = {
  id: string;
  fieldMetadataId: string;
  operand: string;
  value: unknown;
  viewFilterGroupId: string | null;
  positionInViewFilterGroup: number | null;
  subFieldName: string | null;
  relationTargetFieldMetadataId: string | null;
  viewId: string;
};

export type ViewSort = {
  id: string;
  fieldMetadataId: string;
  direction: string;
  subFieldName: string | null;
  viewId: string;
};

export type ViewGroup = {
  id: string;
  isVisible: boolean;
  fieldValue: string;
  position: number;
  viewId: string;
};

export type ViewFilterGroup = {
  id: string;
  parentViewFilterGroupId: string | null;
  logicalOperator: string;
  positionInViewFilterGroup: number | null;
  viewId: string;
};

export type ViewFieldGroup = {
  id: string;
  name: string;
  position: number;
  isVisible: boolean;
  viewId: string;
};

export type ViewField = {
  id: string;
  fieldMetadataId: string;
  isVisible: boolean;
  size: number;
  position: number;
  aggregateOperation: string | null;
  viewId: string;
  viewFieldGroupId: string | null;
};

export type View = {
  id: string;
  name: string;
  objectMetadataId: string;
  type: string;
  key: string | null;
  icon: string;
  position: number;
  isCompact: boolean;
  kanbanAggregateOperation: string | null;
  kanbanAggregateOperationFieldMetadataId: string | null;
  mainGroupByFieldMetadataId: string | null;
  shouldHideEmptyGroups: boolean;
  kanbanColumnWidth: number | null;
  calendarFieldMetadataId: string | null;
  calendarEndFieldMetadataId: string | null;
  anyFieldFilterValue: string | null;
  calendarLayout: string | null;
  viewFields: ViewField[];
  viewFilters: ViewFilter[];
  viewFilterGroups: ViewFilterGroup[];
  viewSorts: ViewSort[];
  viewGroups: ViewGroup[];
  viewFieldGroups: ViewFieldGroup[];
};
