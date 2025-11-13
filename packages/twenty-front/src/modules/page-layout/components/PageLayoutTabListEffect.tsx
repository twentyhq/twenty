import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useEffect } from 'react';

type PageLayoutTabListEffectProps = Pick<
  TabListProps,
  'componentInstanceId' | 'tabs' | 'onChangeTab'
>;

export const PageLayoutTabListEffect = ({
  tabs,
  onChangeTab,
  componentInstanceId,
}: PageLayoutTabListEffectProps) => {
  const [activeTabId, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const visibleTabs = tabs.filter((tab) => !tab.hide);

  const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
  const initialActiveTabId = activeTabExists ? activeTabId : visibleTabs[0]?.id;

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
    onChangeTab?.(initialActiveTabId || '');
  }, [initialActiveTabId, onChangeTab, setActiveTabId]);

  return null;
};
