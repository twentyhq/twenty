import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export type NavigationMenuItemMoveDestination =
  | { kind: 'root'; tabId: string | null }
  | {
      kind: 'section' | 'folder';
      tabId: string | null;
      item: NavigationMenuItem;
    };
