import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';
import { useDragOperation } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_SECTION_DND_TYPE } from '@/navigation-menu-item/common/constants/NavigationMenuSectionDndType';
import { NavigationMenuItemDropLine } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemDropLine';

const SECTION_COLLISION_PRIORITY = 4;

const PLUGINS_WITHOUT_OPTIMISTIC = [SortableKeyboardPlugin];

const StyledSectionSortableRoot = styled.div`
  position: relative;
`;

type NavigationMenuSectionSortableProps = {
  section: Pick<NavigationMenuItem, 'id' | 'folderId'>;
  index: number;
  children: ReactNode;
};

export const NavigationMenuSectionSortable = ({
  section,
  index,
  children,
}: NavigationMenuSectionSortableProps) => {
  const { ref, isDropTarget } = useSortable({
    id: section.id,
    index,
    group: `navigation-menu-sections-${section.folderId ?? 'home'}`,
    type: NAVIGATION_MENU_SECTION_DND_TYPE,
    accept: NAVIGATION_MENU_SECTION_DND_TYPE,
    collisionPriority: SECTION_COLLISION_PRIORITY,
    transition: null,
    plugins: PLUGINS_WITHOUT_OPTIMISTIC,
    feedback: 'clone',
  });
  const { source } = useDragOperation();

  const getDropPosition = () => {
    if (
      !isDropTarget ||
      !isDefined(source) ||
      !isSortable(source) ||
      source.id === section.id
    ) {
      return undefined;
    }

    return source.index < index ? 'bottom' : 'top';
  };

  const dropPosition = getDropPosition();

  return (
    <StyledSectionSortableRoot ref={ref}>
      {isDefined(dropPosition) && (
        <NavigationMenuItemDropLine position={dropPosition} />
      )}
      {children}
    </StyledSectionSortableRoot>
  );
};
