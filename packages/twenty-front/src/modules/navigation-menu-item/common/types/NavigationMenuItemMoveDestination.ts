import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export type NavigationMenuItemMoveDestination = {
  containerId: string | null;
  tabId: string | null;
} & (
  | { kind: 'root' }
  | { kind: 'section' | 'folder'; item: NavigationMenuItem }
);
