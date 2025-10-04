import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

type TabListDropdownMenuItemProps = {
  tab: SingleTabProps;
  activeTabId: string | null;
  loading?: boolean;
  onSelect: (tabId: string) => void;
  disableClick?: boolean;
};

export const TabListDropdownMenuItem = ({
  tab,
  activeTabId,
  loading,
  onSelect,
  disableClick,
}: TabListDropdownMenuItemProps) => {
  const isDisabled = tab.disabled ?? loading;

  return (
    <MenuItemSelectAvatar
      text={tab.title}
      avatar={<TabAvatar tab={tab} />}
      selected={tab.id === activeTabId}
      onClick={isDisabled || disableClick ? undefined : () => onSelect(tab.id)}
      disabled={isDisabled}
    />
  );
};
