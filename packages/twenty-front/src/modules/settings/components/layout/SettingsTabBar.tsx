import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';

type SettingsTabBarProps = Pick<
  TabListProps,
  | 'aria-label'
  | 'behaveAsLinks'
  | 'componentInstanceId'
  | 'tabs'
  | 'selectedTabId'
>;

export const SettingsTabBar = ({
  'aria-label': ariaLabel,
  behaveAsLinks,
  tabs,
  componentInstanceId,
  selectedTabId,
}: SettingsTabBarProps) => {
  return (
    <TabList
      aria-label={ariaLabel}
      behaveAsLinks={behaveAsLinks}
      tabs={tabs}
      componentInstanceId={componentInstanceId}
      selectedTabId={selectedTabId}
      centerTabs
    />
  );
};
