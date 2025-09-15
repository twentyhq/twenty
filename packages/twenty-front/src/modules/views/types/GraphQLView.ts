import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';
import { type ViewField } from '@/views/types/ViewField';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { type ViewKey } from '@/views/types/ViewKey';
import { type ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { type ViewType } from '@/views/types/ViewType';
import { type ViewCalendarLayout } from '~/generated/graphql';

export type GraphQLView = {
  id: string;
  name: string;
  type: ViewType;
  key: ViewKey | null;
  /**
   * @deprecated Use `viewGroups.fieldMetadataId` instead.
   */
  kanbanFieldMetadataId: string;
  kanbanAggregateOperation?: AggregateOperations | null;
  kanbanAggregateOperationFieldMetadataId?: string | null;
  objectMetadataId: string;
  isCompact: boolean;
  openRecordIn: ViewOpenRecordInType;
  viewFields: ViewField[];
  viewFilters: ViewFilter[];
  viewFilterGroups?: ViewFilterGroup[];
  viewSorts: CoreViewSortEssential[];
  viewGroups: ViewGroup[];
  position: number;
  icon: string;
  anyFieldFilterValue?: string | null;
  calendarLayout?: ViewCalendarLayout | null;
  calendarFieldMetadataId?: string | null;
};
