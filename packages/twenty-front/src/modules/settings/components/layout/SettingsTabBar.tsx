import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';

type SettingsTabBarProps = Pick<
  TabListProps,
  'behaveAsLinks' | 'componentInstanceId' | 'tabs'
>;

export const SettingsTabBar = ({
  behaveAsLinks,
  tabs,
  componentInstanceId,
}: SettingsTabBarProps) => {
  return (
    <TabList
      behaveAsLinks={behaveAsLinks}
      tabs={tabs}
      componentInstanceId={componentInstanceId}
      centerTabs
    />
  );
};
