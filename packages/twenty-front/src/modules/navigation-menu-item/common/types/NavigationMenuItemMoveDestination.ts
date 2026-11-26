import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export type NavigationMenuItemMoveDestination =
  | { kind: 'root'; containerId: string | null }
  | {
      kind: 'section' | 'folder';
      containerId: string;
      item: NavigationMenuItem;
    };
