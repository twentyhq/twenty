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
  viewFields: Omit<CoreViewField, 'workspaceId' | 'createdAt' | 'updatedAt'>[];
  viewGroups: Omit<CoreViewGroup, 'workspaceId' | 'createdAt' | 'updatedAt'>[];
  viewFilters: Omit<
    CoreViewFilter,
    'workspaceId' | 'createdAt' | 'updatedAt'
  >[];
  viewFilterGroups?: Omit<
    CoreViewFilterGroup,
    'workspaceId' | 'createdAt' | 'updatedAt'
  >[];
  viewSorts: Omit<CoreViewSort, 'workspaceId' | 'createdAt' | 'updatedAt'>[];
  kanbanAggregateOperation?: AggregateOperations | null;
  kanbanAggregateOperationFieldMetadataId?: string | null;
  position: number;
  icon: string;
  openRecordIn: ViewOpenRecordIn;
  anyFieldFilterValue?: string | null;
  __typename?: 'CoreView';
};
