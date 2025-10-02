import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { TabListDropdownMenuItemWithActions } from '@/ui/layout/tab-list/components/TabListDropdownMenuItemWithActions';
import { useTabListContextOrThrow } from '@/ui/layout/tab-list/contexts/TabListContext';

type TabListOverflowDropdownStaticContentProps = {
  onSelect: (tabId: string) => void;
};

export const TabListOverflowDropdownStaticContent = ({
  onSelect,
}: TabListOverflowDropdownStaticContentProps) => {
  const { overflowingTabs, activeTabId, loading } = useTabListContextOrThrow();

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        {overflowingTabs.map((tab) => (
          <TabListDropdownMenuItemWithActions
            key={tab.id}
            tab={tab}
            activeTabId={activeTabId}
            loading={loading}
            onSelect={onSelect}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
