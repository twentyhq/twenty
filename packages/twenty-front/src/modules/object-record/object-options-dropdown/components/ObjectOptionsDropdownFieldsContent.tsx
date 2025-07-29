import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useObjectOptionsForTable } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForTable';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { ViewFieldsVisibilityDropdownSection } from '@/views/components/ViewFieldsVisibilityDropdownSection';
import { ViewType } from '@/views/types/ViewType';
import { useLingui } from '@lingui/react/macro';
import { IconChevronLeft, IconEyeOff } from 'twenty-ui/display';
import { MenuItemNavigate } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownFieldsContent = () => {
  const { t } = useLingui();
  const {
    viewType,
    recordIndexId,
    objectMetadataItem,
    onContentChange,
    resetContent,
  } = useObjectOptionsDropdown();

  const {
    handleColumnVisibilityChange,
    handleReorderColumns,
    visibleTableColumns,
  } = useObjectOptionsForTable(recordIndexId, objectMetadataItem.id);

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
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Fields`}
      </DropdownMenuHeader>
      <ViewFieldsVisibilityDropdownSection
        title={t`Visible`}
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
          text={t`Hidden Fields`}
        />
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
