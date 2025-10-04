import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { TabListDropdownMenuItem } from '@/ui/layout/tab-list/components/TabListDropdownMenuItem';
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
          <TabListDropdownMenuItem
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
