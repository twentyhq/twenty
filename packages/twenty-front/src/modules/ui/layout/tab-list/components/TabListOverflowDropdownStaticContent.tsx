import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useTabListStateContextOrThrow } from '../contexts/TabListStateContext';
import { TabListDropdownMenuItem } from './TabListDropdownMenuItem';

type TabListOverflowDropdownStaticContentProps = {
  onSelect: (tabId: string) => void;
};

export const TabListOverflowDropdownStaticContent = ({
  onSelect,
}: TabListOverflowDropdownStaticContentProps) => {
  const { overflowTabs, activeTabId, loading } =
    useTabListStateContextOrThrow();

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        {overflowTabs.map((tab) => (
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
