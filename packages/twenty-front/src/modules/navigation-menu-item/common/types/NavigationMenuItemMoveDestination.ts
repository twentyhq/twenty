import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export type NavigationMenuItemMoveDestination =
  | { kind: 'root'; containerId: string | null; tabId: string | null }
  | {
      kind: 'section' | 'folder';
      containerId: string;
      tabId: string | null;
      item: NavigationMenuItem;
    };
