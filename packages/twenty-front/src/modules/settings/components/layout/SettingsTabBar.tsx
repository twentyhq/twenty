import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { useCallback, useEffect } from 'react';
import { TabButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsTabBarProps<TabId extends string = string> = {
  tabs: SingleTabProps<TabId>[];
  componentInstanceId: string;
  behaveAsLinks?: boolean;
  loading?: boolean;
  onChangeTab?: (tabId: TabId) => void;
};

type SettingsTabBarContentProps<TabId extends string = string> = Omit<
  SettingsTabBarProps<TabId>,
  'componentInstanceId'
>;

const StyledTabRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  height: 100%;
  max-width: 100%;
  overflow: hidden;
`;

const SettingsTabBarContent = <TabId extends string>({
  tabs,
  behaveAsLinks = true,
  loading,
  onChangeTab,
}: SettingsTabBarContentProps<TabId>) => {
  const visibleTabs = tabs.filter((tab) => !tab.hide);

  const [activeTabId, setActiveTabId] = useAtomComponentState(
    activeTabIdComponentState,
  );

  const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
  const initialActiveTabId = activeTabExists ? activeTabId : visibleTabs[0]?.id;

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
    onChangeTab?.((initialActiveTabId as TabId | null) ?? ('' as TabId));
  }, [initialActiveTabId, setActiveTabId, onChangeTab]);

  const handleTabSelect = useCallback(
    (tabId: TabId) => {
      setActiveTabId(tabId);
      onChangeTab?.(tabId);
    },
    [setActiveTabId, onChangeTab],
  );

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <>
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
            to={behaveAsLinks ? `#${tab.id}` : undefined}
            tooltipContent={tab.tooltipContent}
            onClick={
              behaveAsLinks
                ? () => onChangeTab?.(tab.id)
                : () => handleTabSelect(tab.id)
            }
          />
        ))}
      </StyledTabRow>
    </>
  );
};

export const SettingsTabBar = <TabId extends string = string>({
  tabs,
  componentInstanceId,
  behaveAsLinks,
  loading,
  onChangeTab,
}: SettingsTabBarProps<TabId>) => (
  <TabListComponentInstanceContext.Provider
    value={{ instanceId: componentInstanceId }}
  >
    <SettingsTabBarContent
      tabs={tabs}
      behaveAsLinks={behaveAsLinks}
      loading={loading}
      onChangeTab={onChangeTab}
    />
  </TabListComponentInstanceContext.Provider>
);
