import { Dropdown } from '@/dropdown/components/Dropdown';
import { useCurrentContentId } from '@/dropdown/hooks/useCurrentContentId';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectOptionsDropdownContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
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

  return (
    <Dropdown
      dropdownId={OBJECT_OPTIONS_DROPDOWN_ID}
      clickableComponent={
        <StyledHeaderDropdownButton>Options</StyledHeaderDropdownButton>
      }
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
