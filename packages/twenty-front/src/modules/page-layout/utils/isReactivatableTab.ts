import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const isReactivatableTab = (tab: PageLayoutTab): boolean => {
  return !tab.isActive && tab.layoutMode === PageLayoutTabLayoutMode.CANVAS;
};
