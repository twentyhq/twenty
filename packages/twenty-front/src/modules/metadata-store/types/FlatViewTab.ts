import { type ViewTab } from '@/views/types/ViewTab';

export type FlatViewTab = Omit<ViewTab, 'viewFilters'> & {
  viewId: string;
};
