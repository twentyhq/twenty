import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';

type SettingsTabBarProps = Pick<
  TabListProps,
  'aria-label' | 'behaveAsLinks' | 'componentInstanceId' | 'tabs'
>;

export const SettingsTabBar = ({
  'aria-label': ariaLabel,
  behaveAsLinks,
  tabs,
  componentInstanceId,
}: SettingsTabBarProps) => {
  return (
    <TabList
      aria-label={ariaLabel}
      behaveAsLinks={behaveAsLinks}
      tabs={tabs}
      componentInstanceId={componentInstanceId}
      centerTabs
    />
  );
};
