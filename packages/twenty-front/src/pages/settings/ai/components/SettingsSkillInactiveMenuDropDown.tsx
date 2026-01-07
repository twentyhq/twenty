import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconArchiveOff, IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

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
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton
          aria-label={t`Inactive Skill Options`}
          Icon={IconDotsVertical}
          accent="tertiary"
        />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            <MenuItem
              text={t`Activate`}
              LeftIcon={IconArchiveOff}
              onClick={handleActivate}
            />
            {isCustomSkill && (
              <MenuItem
                text={t`Delete`}
                LeftIcon={IconTrash}
                accent="danger"
                onClick={handleDelete}
              />
            )}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
