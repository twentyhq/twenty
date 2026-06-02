import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { TabButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsTabBarProps<TabId extends string = string> = {
  tabs: SingleTabProps<TabId>[];
  componentInstanceId: string;
  loading?: boolean;
  onChangeTab?: (tabId: TabId) => void;
};

const StyledTabRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  height: 100%;
`;

export const SettingsTabBar = <TabId extends string = string>({
  tabs,
  componentInstanceId,
  loading,
  onChangeTab,
}: SettingsTabBarProps<TabId>) => {
  const visibleTabs = tabs.filter((tab) => !tab.hide);

  const [activeTabId, setActiveTabId] = useAtomComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
  const initialActiveTabId = activeTabExists ? activeTabId : visibleTabs[0]?.id;

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
    onChangeTab?.((initialActiveTabId as TabId | null) ?? ('' as TabId));
  }, [initialActiveTabId, setActiveTabId, onChangeTab]);

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <TabListFromUrlOptionalEffect
        isInSidePanel={false}
        tabListIds={tabs.map((tab) => tab.id)}
      />
      <StyledTabRow>
        {visibleTabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            title={tab.title}
            LeftIcon={tab.Icon}
            logo={tab.logo}
            active={tab.id === activeTabId}
            disabled={tab.disabled ?? loading}
            pill={tab.pill}
            to={`#${tab.id}`}
            tooltipContent={tab.tooltipContent}
            onClick={() => onChangeTab?.(tab.id)}
          />
        ))}
      </StyledTabRow>
    </TabListComponentInstanceContext.Provider>
  );
};
