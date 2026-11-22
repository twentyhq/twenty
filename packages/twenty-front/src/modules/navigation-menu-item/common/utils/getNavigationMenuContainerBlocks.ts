import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NavigationMenuContainerBlock } from '@/navigation-menu-item/common/types/NavigationMenuContainerBlock';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuContainerBlocks = (
  sortedChildren: NavigationMenuItem[],
): NavigationMenuContainerBlock[] =>
  sortedChildren.reduce<NavigationMenuContainerBlock[]>((blocks, child) => {
    if (child.type === NavigationMenuItemType.SECTION) {
      return [...blocks, { kind: 'section', section: child }];
    }

    const lastBlock = blocks.at(-1);

    if (lastBlock?.kind === 'items') {
      return [
        ...blocks.slice(0, -1),
        { kind: 'items', items: [...lastBlock.items, child] },
      ];
    }

    return [...blocks, { kind: 'items', items: [child] }];
  }, []);
