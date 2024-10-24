import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewGroup } from '@/views/types/ViewGroup';
import { ViewKey } from '@/views/types/ViewKey';
import { ViewSort } from '@/views/types/ViewSort';
import { ViewType } from '@/views/types/ViewType';

export type View = {
  id: string;
  name: string;
  type: ViewType;
  key: ViewKey | null;
  objectMetadataId: string;
  isCompact: boolean;
  viewFields: ViewField[];
  viewGroups: ViewGroup[];
  viewFilters: ViewFilter[];
  viewSorts: ViewSort[];
  kanbanFieldMetadataId: string;
  position: number;
  icon: string;
  __typename: 'View';
};
