import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';

export const isReactivatableTab = ({
  tab,
  objectApplicationId,
}: {
  tab: PageLayoutTab;
  objectApplicationId: string | undefined;
}): boolean => {
  return !tab.isActive && tab.applicationId === objectApplicationId;
};
