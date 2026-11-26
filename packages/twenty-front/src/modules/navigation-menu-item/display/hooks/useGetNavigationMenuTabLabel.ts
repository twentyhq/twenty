import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const useGetNavigationMenuTabLabel = () => {
  const { t } = useLingui();

  return (tab: Pick<NavigationMenuItem, 'name'>) =>
    isNonEmptyString(tab.name) ? tab.name : t`Tab`;
};
