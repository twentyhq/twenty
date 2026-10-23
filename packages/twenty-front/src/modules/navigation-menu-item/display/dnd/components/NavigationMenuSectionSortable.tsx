import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';
import { useDragOperation } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_SECTION_DND_TYPE } from '@/navigation-menu-item/common/constants/NavigationMenuSectionDndType';

const SECTION_COLLISION_PRIORITY = 4;

const PLUGINS_WITHOUT_OPTIMISTIC = [SortableKeyboardPlugin];

const StyledSectionSortableRoot = styled.div`
  position: relative;

  &[data-drop-position]::before {
    background-color: ${themeCssVariables.color.blue};
    border-radius: ${themeCssVariables.border.radius.sm};
    content: '';
    height: 2px;
    left: 0;
    position: absolute;
    width: 100%;
  }

  &[data-drop-position='before']::before {
    top: calc(-1 * ${themeCssVariables.spacing['1.5']} - 1px);
  }

  &[data-drop-position='after']::before {
    bottom: calc(-1 * ${themeCssVariables.spacing['1.5']} - 1px);
  }
`;

type NavigationMenuSectionSortableProps = {
  section: NavigationMenuItem;
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

  const dropPosition =
    isDropTarget &&
    isDefined(source) &&
    isSortable(source) &&
    source.id !== section.id
      ? source.index < index
        ? 'after'
        : 'before'
      : undefined;

  return (
    <StyledSectionSortableRoot ref={ref} data-drop-position={dropPosition}>
      {children}
    </StyledSectionSortableRoot>
  );
};
