import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';

export const isReactivatableTab = (tab: PageLayoutTab): boolean =>
  !tab.isActive;
