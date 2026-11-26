import { useLingui } from '@lingui/react/macro';

import { getNavigationMenuTabLabel } from '@/navigation-menu-item/common/utils/getNavigationMenuTabLabel';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const useGetNavigationMenuTabLabel = () => {
  const { t } = useLingui();

  return (tab: Pick<NavigationMenuItem, 'name'>) =>
    getNavigationMenuTabLabel({ name: tab.name, fallbackLabel: t`Tab` });
};
