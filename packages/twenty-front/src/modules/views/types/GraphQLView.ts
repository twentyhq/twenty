import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
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
  viewSorts: ViewSort[];
  position: number;
  icon: string;
};
