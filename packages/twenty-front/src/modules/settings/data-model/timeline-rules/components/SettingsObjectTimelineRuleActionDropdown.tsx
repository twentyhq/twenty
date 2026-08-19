import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import {
  IconArchive,
  IconArchiveOff,
  IconDotsVertical,
  IconPencil,
  IconRestore,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type SettingsObjectTimelineRuleActionDropdownProps = {
  dropdownId: string;
  isActive: boolean;
  isResettable: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
  onReset: () => void;
};

export const SettingsObjectTimelineRuleActionDropdown = ({
  dropdownId,
  isActive,
  isResettable,
  onEdit,
  onToggleActive,
  onReset,
}: SettingsObjectTimelineRuleActionDropdownProps) => {
  const { closeDropdown } = useCloseDropdown();

  const handleClick = (action: () => void) => {
    action();
    closeDropdown(dropdownId);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton
          aria-label={t`Timeline Rule Options`}
          Icon={IconDotsVertical}
          accent="tertiary"
        />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            <MenuItem
              text={t`Edit`}
              LeftIcon={IconPencil}
              onClick={() => handleClick(onEdit)}
            />
            <MenuItem
              text={isActive ? t`Deactivate` : t`Activate`}
              LeftIcon={isActive ? IconArchive : IconArchiveOff}
              onClick={() => handleClick(onToggleActive)}
            />
            {isResettable && (
              <MenuItem
                text={t`Reset to default`}
                LeftIcon={IconRestore}
                onClick={() => handleClick(onReset)}
              />
            )}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
