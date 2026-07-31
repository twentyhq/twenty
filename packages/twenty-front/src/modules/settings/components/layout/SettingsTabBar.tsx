import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

type SettingsTabBarProps = {
  tabs: SingleTabProps[];
  componentInstanceId: string;
};

export const SettingsTabBar = ({
  tabs,
  componentInstanceId,
}: SettingsTabBarProps) => {
  return (
    <TabList tabs={tabs} componentInstanceId={componentInstanceId} centerTabs />
  );
};
