import { type ViewFilter } from '@/views/types/ViewFilter';
import { type ViewTabType } from '~/generated-metadata/graphql';

export type ViewTab = {
  id: string;
  type: ViewTabType;
  fieldValue?: string | null;
  name?: string | null;
  position: number;
  isVisible: boolean;
  viewId?: string;
  viewFilters?: ViewFilter[];
};
