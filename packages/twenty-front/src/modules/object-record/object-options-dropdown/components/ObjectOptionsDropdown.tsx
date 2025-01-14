import { DROPDOWN_OFFSET_Y } from '@/dropdown/constants/DropdownOffsetY';
import { DROPDOWN_WIDTH } from '@/dropdown/constants/DropdownWidth';
import { useCurrentContentId } from '@/dropdown/hooks/useCurrentContentId';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectOptionsDropdownContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ViewType } from '@/views/types/ViewType';

type ObjectOptionsDropdownProps = {
  viewType: ViewType;
  objectMetadataItem: ObjectMetadataItem;
  recordIndexId: string;
};

export const ObjectOptionsDropdown = ({
  recordIndexId,
  objectMetadataItem,
  viewType,
}: ObjectOptionsDropdownProps) => {
  const { currentContentId, handleContentChange, handleResetContent } =
    useCurrentContentId<ObjectOptionsContentId>();

  const { isDropdownOpen } = useDropdown(OBJECT_OPTIONS_DROPDOWN_ID);

  return (
    <Dropdown
      dropdownId={OBJECT_OPTIONS_DROPDOWN_ID}
      dropdownHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
      dropdownMenuWidth={DROPDOWN_WIDTH}
      dropdownOffset={{ y: DROPDOWN_OFFSET_Y }}
      clickableComponent={
        <StyledHeaderDropdownButton isUnfolded={isDropdownOpen}>
          Options
        </StyledHeaderDropdownButton>
      }
      onClose={handleResetContent}
      dropdownComponents={
        <ObjectOptionsDropdownContext.Provider
          value={{
            viewType,
            objectMetadataItem,
            recordIndexId,
            currentContentId,
            onContentChange: handleContentChange,
            resetContent: handleResetContent,
            dropdownId: OBJECT_OPTIONS_DROPDOWN_ID,
          }}
        >
          <ObjectOptionsDropdownContent />
        </ObjectOptionsDropdownContext.Provider>
      }
    />
  );
};
