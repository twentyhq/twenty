import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getRecordNavigationMenuItemLabel = (
  item: Pick<NavigationMenuItem, 'targetRecordIdentifier'>,
): string => {
  return item.targetRecordIdentifier?.labelIdentifier ?? '';
};
