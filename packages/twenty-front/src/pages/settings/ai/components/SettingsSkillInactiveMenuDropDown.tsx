import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconArchiveOff, IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { Menu } from 'twenty-ui/primitives/surfaces';

type SettingsSkillInactiveMenuDropDownProps = {
  isCustomSkill: boolean;
  onActivate: () => void;
  onDelete: () => void;
  skillId: string;
};

export const SettingsSkillInactiveMenuDropDown = ({
  onActivate,
  skillId,
  onDelete,
  isCustomSkill,
}: SettingsSkillInactiveMenuDropDownProps) => {
  const dropdownId = `${skillId}-settings-skill-inactive-menu-dropdown`;

  const { closeDropdown } = useCloseDropdown();

  const handleActivate = () => {
    onActivate();
    closeDropdown(dropdownId);
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown(dropdownId);
  };

  return (
    <DropdownMenu
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton
          aria-label={t`Inactive Skill Options`}
          emphasis="subtle"
        >
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <Menu.Group>
            <Menu.Item
              startIcon={<IconArchiveOff />}
              onClick={handleActivate}
            >{t`Activate`}</Menu.Item>
            {isCustomSkill && (
              <Menu.Item
                startIcon={<IconTrash />}
                color="danger"
                onClick={handleDelete}
              >{t`Delete`}</Menu.Item>
            )}
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
