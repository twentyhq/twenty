import {
  IconBaselineDensitySmall,
  IconChevronLeft,
  MenuItemToggle,
} from 'twenty-ui';

import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewType } from '@/views/types/ViewType';

export const ObjectOptionsDropdownViewSettingsContent = () => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const { recordIndexId, objectMetadataItem, viewType, resetContent } =
    useOptionsDropdown();

  const { isCompactModeActive, setAndPersistIsCompactModeActive } =
    useObjectOptionsForBoard({
      objectNameSingular: objectMetadataItem.nameSingular,
      recordBoardId: recordIndexId,
      viewBarId: recordIndexId,
    });

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
        View settings
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
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
