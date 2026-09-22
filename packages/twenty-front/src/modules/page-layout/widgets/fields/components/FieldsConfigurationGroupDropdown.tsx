import { ListItem } from 'twenty-ui/primitives/navigation';
import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconNewSection,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';

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
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownPlacement="bottom-start"
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            <ListItem
              startIcon={<IconPencil />}
              onClick={handleRename}
            >{t`Rename`}</ListItem>
            <ListItem
              startIcon={<IconTrash />}
              onClick={handleDelete}
              color="danger"
            >{t`Delete`}</ListItem>
            <ListItem
              startIcon={<IconNewSection />}
              onClick={handleAddGroup}
            >{t`Add a Group`}</ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
