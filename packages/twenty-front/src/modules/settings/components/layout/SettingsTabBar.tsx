import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { TabButton } from 'twenty-ui/input';

type SettingsTabBarProps = {
  tabs: SingleTabProps[];
  componentInstanceId: string;
};

const StyledTabBar = styled.div`
  display: flex;
  flex: 1;
  gap: ${TAB_LIST_GAP}px;
  justify-content: center;
  min-width: 0;
`;

export const SettingsTabBar = ({
  tabs,
  componentInstanceId,
}: SettingsTabBarProps) => {
  const visibleTabs = tabs.filter((tab) => !tab.hide);

  const [activeTabId, setActiveTabId] = useAtomComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
  const initialActiveTabId = activeTabExists ? activeTabId : visibleTabs[0]?.id;

  useEffect(() => {
    setActiveTabId(initialActiveTabId ?? null);
  }, [initialActiveTabId, setActiveTabId]);

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
      <StyledTabBar>
        {visibleTabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            title={tab.title}
            LeftIcon={tab.Icon}
            logo={tab.logo}
            active={tab.id === activeTabId}
            disabled={tab.disabled}
            pill={tab.pill}
            to={`#${tab.id}`}
            tooltipContent={tab.tooltipContent}
          />
        ))}
      </StyledTabBar>
    </TabListComponentInstanceContext.Provider>
  );
};
