import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemAgentsSection = (
  item: Pick<NavigationMenuItem, 'type'>,
) => item.type === NavigationMenuItemType.AI_AGENTS;
