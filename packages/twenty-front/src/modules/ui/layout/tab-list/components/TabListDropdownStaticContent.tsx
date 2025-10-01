import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useTabListStateContextOrThrow } from '../contexts/TabListStateContext';
import { TabListDropdownMenuItem } from './TabListDropdownMenuItem';

type TabListDropdownStaticContentProps = {
  onSelect: (tabId: string) => void;
};

export const TabListDropdownStaticContent = ({
  onSelect,
}: TabListDropdownStaticContentProps) => {
  const { hiddenTabs, activeTabId, loading } = useTabListStateContextOrThrow();

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        {hiddenTabs.map((tab) => (
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
