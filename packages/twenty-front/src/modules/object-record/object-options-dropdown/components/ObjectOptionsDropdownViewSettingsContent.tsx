import {
  IconBaselineDensitySmall,
  IconChevronLeft,
  MenuItemToggle,
} from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordIndexOptionsContentId } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { DropdownContentItem } from '@/ui/layout/dropdown/components/DropdownContentItem';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdownContent } from '@/ui/layout/dropdown/hooks/useDropdownContent';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewType } from '@/views/types/ViewType';

type ObjectOptionsDropdownViewSettingsContentProps = {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
  viewType: ViewType;
};

export const ObjectOptionsDropdownViewSettingsContent = ({
  viewType,
  recordIndexId,
  objectMetadataItem,
}: ObjectOptionsDropdownViewSettingsContentProps) => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const { resetContent } = useDropdownContent<RecordIndexOptionsContentId>();

  const { isCompactModeActive, setAndPersistIsCompactModeActive } =
    useObjectOptionsForBoard({
      objectNameSingular: objectMetadataItem.nameSingular,
      recordBoardId: recordIndexId,
      viewBarId: recordIndexId,
    });

  return (
    <>
      <DropdownContentItem id="viewSettings">
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
      </DropdownContentItem>
    </>
  );
};
