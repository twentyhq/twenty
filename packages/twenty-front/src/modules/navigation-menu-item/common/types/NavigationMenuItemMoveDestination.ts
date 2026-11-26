import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export type NavigationMenuItemMoveDestination = {
  kind: 'section' | 'folder';
  containerId: string;
  item: NavigationMenuItem;
};
