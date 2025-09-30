import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { TabListDropdownMenuItem } from './TabListDropdownMenuItem';

type TabListDropdownStaticContentProps = {
  hiddenTabs: SingleTabProps[];
  activeTabId: string | null;
  loading?: boolean;
  onSelect: (tabId: string) => void;
};

export const TabListDropdownStaticContent = ({
  hiddenTabs,
  activeTabId,
  loading,
  onSelect,
}: TabListDropdownStaticContentProps) => {
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
