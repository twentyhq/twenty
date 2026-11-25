import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export type NamedNavigationMenuItem = NavigationMenuItem & { name: string };
