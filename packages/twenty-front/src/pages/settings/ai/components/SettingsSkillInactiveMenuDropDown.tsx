import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconArchiveOff, IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
          emphasis="subtle"
        >
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            <ListItem
              startIcon={<IconArchiveOff />}
              onClick={getDropdownMenuItemClickHandler(handleActivate)}
            >
              <OverflowingTextWithTooltip text={t`Activate`} />
            </ListItem>
            {isCustomSkill && (
              <ListItem
                startIcon={<IconTrash />}
                color="danger"
                onClick={getDropdownMenuItemClickHandler(handleDelete)}
              >
                <OverflowingTextWithTooltip text={t`Delete`} />
              </ListItem>
            )}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
