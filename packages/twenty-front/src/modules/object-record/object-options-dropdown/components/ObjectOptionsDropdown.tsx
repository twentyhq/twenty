import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectOptionsDropdownButton } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownButton';
import { ObjectOptionsDropdownContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { ViewType } from '@/views/types/ViewType';
import { useCallback, useState } from 'react';

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
  const [currentContentId, setCurrentContentId] =
    useState<ObjectOptionsContentId | null>(null);

  const handleContentChange = useCallback((key: ObjectOptionsContentId) => {
    setCurrentContentId(key);
  }, []);

  const handleResetContent = useCallback(() => {
    setCurrentContentId(null);
  }, []);

  return (
    <Dropdown
      dropdownId={OBJECT_OPTIONS_DROPDOWN_ID}
      clickableComponent={<ObjectOptionsDropdownButton />}
      dropdownMenuWidth={'200px'}
      dropdownHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
      dropdownOffset={{ y: 8 }}
      dropdownComponents={
        <ObjectOptionsDropdownContext.Provider
          value={{
            viewType,
            objectMetadataItem,
            recordIndexId,
            currentContentId,
            onContentChange: handleContentChange,
            resetContent: handleResetContent,
          }}
        >
          <ObjectOptionsDropdownContent />
        </ObjectOptionsDropdownContext.Provider>
      }
    />
  );
};
