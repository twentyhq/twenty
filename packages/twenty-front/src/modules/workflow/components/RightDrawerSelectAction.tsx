import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import {
  IconPlaystationSquare,
  IconPlug,
  IconPlus,
  IconSearch,
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

  const options: Array<{
    name: string;
    type: 'standard' | 'custom';
    icon: any;
  }> = [
    {
      name: 'Create Record',
      type: 'standard',
      icon: IconPlus,
    },
    {
      name: 'Find Records',
      type: 'standard',
      icon: IconSearch,
    },
  ];

  const tabs = [
    {
      id: 'all',
      title: 'All',
      Icon: IconSettingsAutomation,
    },
    {
      id: 'standard',
      title: 'Standard',
      Icon: IconPlaystationSquare,
    },
    {
      id: 'custom',
      title: 'Custom',
      Icon: IconPlug,
    },
  ];

  const { activeTabIdState } = useTabList(tabListId);
  const activeTabId = useRecoilValue(activeTabIdState);

  return (
    <StyledShowPageRightContainer>
      <StyledTabListContainer>
        <TabList loading={false} tabListId={tabListId} tabs={tabs} />
      </StyledTabListContainer>

      <StyledActionListContainer>
        {options
          .filter(
            (option) => activeTabId === 'all' || option.type === activeTabId,
          )
          .map((option, index) => (
            <MenuItem
              key={`${activeTabId}-${index}`}
              LeftIcon={option.icon}
              text={option.name}
            />
          ))}
      </StyledActionListContainer>
    </StyledShowPageRightContainer>
  );
};
