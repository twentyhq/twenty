import { IconChevronLeft, IconEyeOff, MenuItemNavigate } from 'twenty-ui';

import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useObjectOptionsForTable } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForTable';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { ViewFieldsVisibilityDropdownSection } from '@/views/components/ViewFieldsVisibilityDropdownSection';
import { ViewType } from '@/views/types/ViewType';

export const ObjectOptionsDropdownFieldsContent = () => {
  const {
    viewType,
    recordIndexId,
    objectMetadataItem,
    onContentChange,
    resetContent,
  } = useOptionsDropdown();

  const {
    handleColumnVisibilityChange,
    handleReorderColumns,
    visibleTableColumns,
  } = useObjectOptionsForTable(recordIndexId);

  const {
    visibleBoardFields,
    handleReorderBoardFields,
    handleBoardFieldVisibilityChange,
  } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const visibleRecordFields =
    viewType === ViewType.Kanban ? visibleBoardFields : visibleTableColumns;

  const handleReorderFields =
    viewType === ViewType.Kanban
      ? handleReorderBoardFields
      : handleReorderColumns;

  const handleChangeFieldVisibility =
    viewType === ViewType.Kanban
      ? handleBoardFieldVisibilityChange
      : handleColumnVisibilityChange;

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
        Fields
      </DropdownMenuHeader>
      <ViewFieldsVisibilityDropdownSection
        title="Visible"
        fields={visibleRecordFields}
        isDraggable
        onDragEnd={handleReorderFields}
        onVisibilityChange={handleChangeFieldVisibility}
        showSubheader={false}
        showDragGrip={true}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer scrollable={false}>
        <MenuItemNavigate
          onClick={() => onContentChange('hiddenFields')}
          LeftIcon={IconEyeOff}
          text="Hidden Fields"
        />
      </DropdownMenuItemsContainer>
    </>
  );
};
