import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import {
  IconPlaystationSquare,
  IconPlug,
  IconPlus,
  IconSettingsAutomation,
} from 'twenty-ui';

// FIXME: copy-pasted
const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
  height: 100%;
`;

// FIXME: copy-pasted
const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
`;

const StyledActionListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  padding-block: ${({ theme }) => theme.spacing(1)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

export const TAB_LIST_COMPONENT_ID = 'workflow-page-right-tab-list';

export const RightDrawerSelectAction = () => {
  const tabListId = `${TAB_LIST_COMPONENT_ID}`;

  const tabs = [
    {
      id: 'all',
      title: 'All',
      Icon: IconSettingsAutomation,
      options: [
        {
          name: 'Test',
        },
        {
          name: 'Test 2',
        },
        {
          name: 'Test 3',
        },
      ],
    },
    {
      id: 'standard',
      title: 'Standard',
      Icon: IconPlaystationSquare,
      options: [
        {
          name: 'Test 4',
        },
        {
          name: 'Test 5',
        },
        {
          name: 'Test 6',
        },
      ],
    },
    {
      id: 'custom',
      title: 'Custom',
      Icon: IconPlug,
      options: [
        {
          name: 'Test 7',
        },
        {
          name: 'Test 8',
        },
        {
          name: 'Test 9',
        },
      ],
    },
  ];

  const { activeTabIdState } = useTabList(tabListId);
  const activeTabId = useRecoilValue(activeTabIdState);

  const selectedTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <StyledShowPageRightContainer>
      <StyledTabListContainer>
        <TabList loading={false} tabListId={tabListId} tabs={tabs} />
      </StyledTabListContainer>

      <StyledActionListContainer>
        {selectedTab === undefined
          ? null
          : selectedTab.options.map((option, index) => (
              <MenuItem
                key={`${activeTabId}-${index}`}
                LeftIcon={IconPlus}
                text={option.name}
              />
            ))}
      </StyledActionListContainer>
    </StyledShowPageRightContainer>
  );
};
