import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewGroup } from '@/views/types/ViewGroup';
import { ViewKey } from '@/views/types/ViewKey';
import { ViewSort } from '@/views/types/ViewSort';
import { ViewType } from '@/views/types/ViewType';

export type GraphQLView = {
  id: string;
  name: string;
  type: ViewType;
  key: ViewKey | null;
  kanbanFieldMetadataId: string;
  objectMetadataId: string;
  isCompact: boolean;
  viewFields: ViewField[];
  viewFilters: ViewFilter[];
  viewFilterGroups?: ViewFilterGroup[];
  viewSorts: ViewSort[];
  viewGroups: ViewGroup[];
  position: number;
  icon: string;
};
