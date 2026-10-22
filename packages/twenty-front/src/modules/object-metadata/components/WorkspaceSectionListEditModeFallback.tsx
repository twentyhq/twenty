import { styled } from '@linaria/react';
import { useContext } from 'react';

import { NavigationMenuItemContainerContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemContainerContext';

import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { WorkspaceSectionAddMenuItemButton } from '@/navigation-menu-item/edit/components/WorkspaceSectionAddMenuItemButton';
import type { NavigationMenuItemSectionListDndKitProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionListDndKitProps';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFallback = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

type WorkspaceSectionListEditModeFallbackProps = Pick<
  NavigationMenuItemSectionListDndKitProps,
  'filteredItems' | 'folderChildrenById' | 'onActiveObjectMetadataItemClick'
>;

export const WorkspaceSectionListEditModeFallback = ({
  filteredItems,
  folderChildrenById,
  onActiveObjectMetadataItemClick,
}: WorkspaceSectionListEditModeFallbackProps) => {
  const { containerId } = useContext(NavigationMenuItemContainerContext);

  return (
    <StyledFallback>
      <WorkspaceSectionListReadOnly
        filteredItems={filteredItems}
        folderChildrenById={folderChildrenById}
        onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
      />
      <WorkspaceSectionAddMenuItemButton
        containerId={containerId}
        position={filteredItems.length}
      />
    </StyledFallback>
  );
};
