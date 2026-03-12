import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconNewSection,
  IconPencil,
  IconTrash,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

import { getFieldsConfigurationGroupEditDropdownId } from '@/page-layout/widgets/fields/utils/getFieldsConfigurationGroupEditDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

type FieldsConfigurationGroupDropdownProps = {
  groupId: string;
  onStartRename: () => void;
  onDelete: () => void;
  onAddGroup?: () => void;
};

export const FieldsConfigurationGroupDropdown = ({
  groupId,
  onStartRename,
  onDelete,
  onAddGroup,
}: FieldsConfigurationGroupDropdownProps) => {
  const { t } = useLingui();

  const dropdownId = getFieldsConfigurationGroupEditDropdownId(groupId);

  const { closeDropdown } = useCloseDropdown();

  const handleRename = () => {
    closeDropdown(dropdownId);
    onStartRename();
  };

  const handleDelete = () => {
    closeDropdown(dropdownId);
    onDelete();
  };

  const handleAddGroup = () => {
    closeDropdown(dropdownId);
    onAddGroup?.();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownPlacement="bottom-start"
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconPencil}
              onClick={handleRename}
              accent="default"
              text={t`Rename`}
            />
            <MenuItem
              LeftIcon={IconTrash}
              onClick={handleDelete}
              accent="danger"
              text={t`Delete`}
            />
            <MenuItem
              LeftIcon={IconNewSection}
              onClick={handleAddGroup}
              accent="default"
              text={t`Add a Group`}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
