import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconRestore } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type SettingsApplicationTimelineActivityTypeRowDropdownProps = {
  disabled: boolean;
  timelineActivityTypeId: string;
  onReset: () => void;
};

export const SettingsApplicationTimelineActivityTypeRowDropdown = ({
  disabled,
  timelineActivityTypeId,
  onReset,
}: SettingsApplicationTimelineActivityTypeRowDropdownProps) => {
  const dropdownId = `timeline-activity-type-${timelineActivityTypeId}`;
  const { closeDropdown } = useCloseDropdown();

  const handleReset = () => {
    closeDropdown(dropdownId);
    onReset();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <LightIconButton
          Icon={IconDotsVertical}
          accent="tertiary"
          title={t`More options`}
          disabled={disabled}
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconRestore}
              text={t`Reset to default`}
              onClick={handleReset}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
