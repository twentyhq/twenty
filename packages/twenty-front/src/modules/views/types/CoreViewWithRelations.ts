import {
  type AggregateOperations,
  type CoreViewField,
  type CoreViewFieldGroup,
  type CoreViewFilter,
  type CoreViewFilterGroup,
  type CoreViewGroup,
  type CoreViewSort,
  type ViewCalendarLayout,
  type ViewKey,
  type ViewOpenRecordIn,
  type ViewType,
  type ViewVisibility,
} from '~/generated-metadata/graphql';

export type CoreViewFieldEssential = Omit<
  CoreViewField,
  'workspaceId' | 'createdAt' | 'updatedAt'
>;

export type CoreViewFieldGroupEssential = Omit<
  CoreViewFieldGroup,
  'workspaceId' | 'createdAt' | 'updatedAt' | 'viewFields'
> & {
  viewFields: CoreViewFieldEssential[];
};

export type CoreViewWithRelations = {
  id: string;
  name: string;
  type: ViewType;
  key?: ViewKey | null;
  objectMetadataId: string;
  isCompact: boolean;
  viewFields: CoreViewFieldEssential[];
  viewFieldGroups?: CoreViewFieldGroupEssential[];
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
  mainGroupByFieldMetadataId?: string | null;
  shouldHideEmptyGroups: boolean;
  kanbanAggregateOperation?: AggregateOperations | null;
  kanbanAggregateOperationFieldMetadataId?: string | null;
  calendarFieldMetadataId?: string | null;
  calendarLayout?: ViewCalendarLayout | null;
  position: number;
  icon: string;
  openRecordIn: ViewOpenRecordIn;
  anyFieldFilterValue?: string | null;
  visibility: ViewVisibility;
  createdByUserWorkspaceId?: string | null;
  __typename?: 'CoreView';
};
