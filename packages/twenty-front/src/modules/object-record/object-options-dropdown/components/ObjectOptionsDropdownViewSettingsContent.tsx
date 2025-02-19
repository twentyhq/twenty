import {
  IconBaselineDensitySmall,
  IconChevronLeft,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  MenuItem,
  MenuItemToggle,
} from 'twenty-ui';

import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewType } from '@/views/types/ViewType';
import { useState } from 'react';

export type OpenInType = 'sidebar' | 'record-page';

export const ObjectOptionsDropdownViewSettingsContent = () => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const {
    recordIndexId,
    objectMetadataItem,
    viewType,
    resetContent,
    onContentChange,
  } = useOptionsDropdown();

  const { isCompactModeActive, setAndPersistIsCompactModeActive } =
    useObjectOptionsForBoard({
      objectNameSingular: objectMetadataItem.nameSingular,
      recordBoardId: recordIndexId,
      viewBarId: recordIndexId,
    });

  const [openIn, setOpenIn] = useState<OpenInType>('sidebar');

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
        View settings
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <MenuItem
          onClick={() => onContentChange('viewSettingsOpenIn')}
          LeftIcon={
            openIn === 'sidebar' ? IconLayoutSidebarRight : IconLayoutNavbar
          }
          text="Open in"
          contextualText={openIn === 'sidebar' ? 'Sidebar' : 'Record Page'}
          hasSubMenu
        />
        {viewType === ViewType.Kanban && (
          <MenuItemToggle
            LeftIcon={IconBaselineDensitySmall}
            onToggleChange={() =>
              setAndPersistIsCompactModeActive(
                !isCompactModeActive,
                currentViewWithCombinedFiltersAndSorts,
              )
            }
            toggled={isCompactModeActive}
            text="Compact view"
            toggleSize="small"
          />
        )}
      </DropdownMenuItemsContainer>
    </>
  );
};
