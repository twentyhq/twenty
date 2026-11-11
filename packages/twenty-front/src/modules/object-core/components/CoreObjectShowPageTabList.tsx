import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

type CoreObjectShowPageTabListProps = {
  'aria-label': string;
  activeTabId: string;
  componentInstanceId: string;
  tabs: SingleTabProps[];
};

export const CoreObjectShowPageTabList = ({
  'aria-label': ariaLabel,
  activeTabId,
  componentInstanceId,
  tabs,
}: CoreObjectShowPageTabListProps) => (
  <TabList
    aria-label={ariaLabel}
    componentInstanceId={componentInstanceId}
    defaultActiveTabId={activeTabId}
    centerTabs
    tabs={tabs}
  />
);
