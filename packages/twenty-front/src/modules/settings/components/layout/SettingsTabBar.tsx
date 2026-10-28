import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListSelectionSyncEffect } from '@/ui/layout/tab-list/components/TabListSelectionSyncEffect';
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
  const visibleTabs = tabs.filter((tab) => !tab.hide);

  if (visibleTabs.length < 2) {
    return (
      <TabListSelectionSyncEffect
        componentInstanceId={componentInstanceId}
        nextActiveTabId={visibleTabs[0]?.id ?? null}
      />
    );
  }

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
