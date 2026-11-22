import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuTabWithOnlyUnavailableSections = ({
  tabId,
  navigationMenuItems,
  isBuiltInSectionAvailable,
}: {
  tabId: string;
  navigationMenuItems: Pick<
    NavigationMenuItem,
    'parentId' | 'builtInSectionKey'
  >[];
  isBuiltInSectionAvailable: (
    builtInSectionKey: string | null | undefined,
  ) => boolean;
}) => {
  const tabChildren = navigationMenuItems.filter(
    (item) => item.parentId === tabId,
  );

  return (
    tabChildren.length > 0 &&
    tabChildren.every(
      (child) =>
        isDefined(child.builtInSectionKey) &&
        !isBuiltInSectionAvailable(child.builtInSectionKey),
    )
  );
};
