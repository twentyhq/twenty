import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useToggleScrollWrapper } from '@/ui/utilities/scroll/hooks/useToggleScrollWrapper';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type MouseEvent, useCallback } from 'react';
import { RecordTableColumnHead } from './RecordTableColumnHead';
import { RecordTableColumnHeadDropdownMenu } from './RecordTableColumnHeadDropdownMenu';

type RecordTableColumnHeadWithDropdownProps = {
  recordField: RecordField;
  objectMetadataId: string;
};

export const RecordTableColumnHeadWithDropdown = ({
  objectMetadataId,
  recordField,
}: RecordTableColumnHeadWithDropdownProps) => {
  const { toggleScrollXWrapper, toggleScrollYWrapper } =
    useToggleScrollWrapper();

  const dropdownId = recordField.fieldMetadataItemId + '-header';

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { openDropdown } = useOpenDropdown();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const handleDropdownOpen = useCallback(() => {
    toggleScrollXWrapper(false);
    toggleScrollYWrapper(false);
  }, [toggleScrollXWrapper, toggleScrollYWrapper]);

  const handleDropdownClose = useCallback(() => {
    toggleScrollXWrapper(true);
    toggleScrollYWrapper(true);
  }, [toggleScrollXWrapper, toggleScrollYWrapper]);

  // Right click does not emit a click event, so the click outside listener
  // cannot close the dropdowns that are already open
  const handleContextMenu = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const wasDropdownOpen = isDropdownOpen;

      closeAnyOpenDropdown();

      if (!wasDropdownOpen) {
        openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
      }
    },
    [closeAnyOpenDropdown, dropdownId, isDropdownOpen, openDropdown],
  );

  return (
    <Dropdown
      onOpen={handleDropdownOpen}
      onClose={handleDropdownClose}
      dropdownId={dropdownId}
      clickableComponent={
        <RecordTableColumnHead
          recordField={recordField}
          onContextMenu={handleContextMenu}
        />
      }
      dropdownComponents={
        <RecordTableColumnHeadDropdownMenu
          recordField={recordField}
          objectMetadataId={objectMetadataId}
        />
      }
      dropdownOffset={{ x: -1 }}
      dropdownPlacement="bottom-start"
    />
  );
};
