import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { styled } from '@linaria/react';
import { TabButton } from 'twenty-ui-deprecated/input';

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
  const visibleTabIds = visibleTabs.map((tab) => tab.id);

  const activeTabId = useSettingsActiveTabId(
    componentInstanceId,
    visibleTabIds,
  );

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <TabListFromUrlOptionalEffect
        isInSidePanel={false}
        tabListIds={visibleTabIds}
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
