import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export type NavigationMenuContainerBlock =
  | { kind: 'items'; items: NavigationMenuItem[] }
  | { kind: 'section'; section: NavigationMenuItem };
