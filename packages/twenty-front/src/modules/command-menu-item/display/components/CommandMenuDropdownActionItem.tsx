import { AppMenuItemIcon } from '@/applications/components/AppMenuItemIcon';
import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { CommandListItemLoader } from '@/command-menu-item/display/components/CommandListItemLoader';
import { useCommandMenuItemDisplay } from '@/command-menu-item/display/hooks/useCommandMenuItemDisplay';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { Dropdown } from 'twenty-ui/components';

export const CommandMenuDropdownActionItem = ({
  item,
}: {
  item: CommandMenuItemDefinition;
}) => {
  const { Icon, label, handleClick, disabled, progress, isLoading } =
    useCommandMenuItemDisplay(item);
  const isThirdPartyApp = useIsThirdPartyApplication(item.applicationId);
  const { applicationChipData } = useApplicationChipData({
    applicationId: item.applicationId,
  });

  return (
    <Dropdown.ActionItem
      disabled={disabled}
      onClick={handleClick}
      closeOnClick={false}
      startIcon={
        isThirdPartyApp ? (
          <AppMenuItemIcon applicationId={item.applicationId} />
        ) : (
          <Icon />
        )
      }
      description={isThirdPartyApp ? applicationChipData.name : undefined}
      endIcon={
        isLoading ? <CommandListItemLoader progress={progress} /> : undefined
      }
    >
      {label}
    </Dropdown.ActionItem>
  );
};
