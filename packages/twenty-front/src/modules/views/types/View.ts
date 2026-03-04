import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type ViewField } from '@/views/types/ViewField';
import { type ViewFieldGroup } from '@/views/types/ViewFieldGroup';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { type ViewKey } from '@/views/types/ViewKey';
import { type ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { type ViewType } from '@/views/types/ViewType';
import {
  type ViewCalendarLayout,
  type ViewVisibility,
} from '~/generated-metadata/graphql';
import { type ViewSort } from '@/views/types/ViewSort';

export type View = {
  id: string;
  name: string;
  type: ViewType;
  key: ViewKey | null;
  objectMetadataId: string;
  isCompact: boolean;
  viewFields: ViewField[];
  viewFieldGroups?: ViewFieldGroup[];
  viewGroups: ViewGroup[];
  viewFilters: ViewFilter[];
  viewFilterGroups?: ViewFilterGroup[];
  viewSorts: ViewSort[];
  kanbanAggregateOperation: AggregateOperations | null;
  kanbanAggregateOperationFieldMetadataId: string | null;
  mainGroupByFieldMetadataId?: string | null;
  shouldHideEmptyGroups: boolean;
  calendarFieldMetadataId?: string | null;
  calendarLayout?: ViewCalendarLayout | null;
  position: number;
  icon: string;
  openRecordIn: ViewOpenRecordInType;
  anyFieldFilterValue?: string | null;
  visibility: ViewVisibility;
  createdByUserWorkspaceId?: string | null;
  __typename: 'View';
};
