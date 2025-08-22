import {
  type AggregateOperations,
  type CoreViewField,
  type CoreViewFilter,
  type CoreViewFilterGroup,
  type CoreViewGroup,
  type CoreViewSort,
  type ViewKey,
  type ViewOpenRecordIn,
  type ViewType,
} from '~/generated-metadata/graphql';

export type CoreViewWithRelations = {
  id: string;
  name: string;
  type: ViewType;
  key?: ViewKey | null;
  objectMetadataId: string;
  isCompact: boolean;
  viewFields: Omit<CoreViewField, 'workspaceId'>[];
  viewGroups: Omit<CoreViewGroup, 'workspaceId'>[];
  viewFilters: Omit<CoreViewFilter, 'workspaceId'>[];
  viewFilterGroups?: Omit<CoreViewFilterGroup, 'workspaceId'>[];
  viewSorts: Omit<CoreViewSort, 'workspaceId'>[];
  kanbanAggregateOperation?: AggregateOperations | null;
  kanbanAggregateOperationFieldMetadataId?: string | null;
  position: number;
  icon: string;
  openRecordIn: ViewOpenRecordIn;
  anyFieldFilterValue?: string | null;
  __typename?: 'CoreView';
};
