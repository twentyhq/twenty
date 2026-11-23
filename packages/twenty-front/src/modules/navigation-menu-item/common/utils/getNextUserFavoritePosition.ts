import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNextUserFavoritePosition = (
  navigationMenuItems: Pick<
    NavigationMenuItem,
    'parentId' | 'userWorkspaceId' | 'position'
  >[],
): number =>
  Math.max(
    ...navigationMenuItems
      .filter(
        (item) => !isDefined(item.parentId) && isDefined(item.userWorkspaceId),
      )
      .map((item) => item.position),
    0,
  ) + 1;
