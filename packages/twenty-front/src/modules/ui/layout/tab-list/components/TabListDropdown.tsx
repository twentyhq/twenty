import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { Dropdown } from 'twenty-ui/components';

type TabListDropdownProps = {
  dropdownId: string;
  overflow: {
    hiddenTabsCount: number;
    isActiveTabHidden: boolean;
  };
  hiddenTabs: SingleTabProps[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  loading?: boolean;
};

export const TabListDropdown = ({
  dropdownId,
  overflow,
  hiddenTabs,
  activeTabId,
  onTabSelect,
  loading,
}: TabListDropdownProps) => (
  <DropdownRoot dropdownId={dropdownId} type="picker">
    <Dropdown.Trigger
      render={
        <TabMoreButton
          hiddenTabsCount={overflow.hiddenTabsCount}
          active={overflow.isActiveTabHidden}
        />
      }
    />
    <DropdownContent align="end" sideOffset={8}>
      <Dropdown.Section>
        {hiddenTabs.map((tab) => (
          <Dropdown.OptionItem
            key={tab.id}
            onSelect={() => onTabSelect(tab.id)}
            disabled={tab.disabled ?? loading}
            selected={tab.id === activeTabId}
            startIcon={<TabAvatar tab={tab} />}
          >
            {tab.title}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </DropdownContent>
  </DropdownRoot>
);
