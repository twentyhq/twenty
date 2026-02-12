import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';
import {
  type AggregateOperations,
  type CoreViewField,
  type CoreViewFilter,
  type CoreViewFilterGroup,
  type CoreViewGroup,
  type ViewCalendarLayout,
  type ViewKey,
  type ViewOpenRecordIn,
  type ViewType,
  type ViewVisibility,
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
  viewSorts: CoreViewSortEssential[];
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
