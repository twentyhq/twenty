import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconNewSection,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';

import { getFieldsConfigurationGroupEditDropdownId } from '@/page-layout/widgets/fields/utils/getFieldsConfigurationGroupEditDropdownId';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { Menu } from 'twenty-ui/primitives/surfaces';

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
    <DropdownMenu
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownPlacement="bottom-start"
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <Menu.Group>
            <Menu.Item
              startIcon={<IconPencil />}
              onClick={handleRename}
            >{t`Rename`}</Menu.Item>
            <Menu.Item
              startIcon={<IconTrash />}
              onClick={handleDelete}
              color="danger"
            >{t`Delete`}</Menu.Item>
            <Menu.Item
              startIcon={<IconNewSection />}
              onClick={handleAddGroup}
            >{t`Add a Group`}</Menu.Item>
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
