import { SettingsAdminTabContent } from '@/settings/admin-panel/components/SettingsAdminTabContent';
import { SETTINGS_ADMIN_TABS } from '@/settings/admin-panel/constants/SettingsAdminTabs';
import { SETTINGS_ADMIN_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminTabsId';
import { TabList } from '@/ui/layout/tab/components/TabList';
import styled from '@emotion/styled';
import { IconSettings2, IconVariable } from 'twenty-ui';

const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAdminContent = () => {
  const tabs = [
    {
      id: SETTINGS_ADMIN_TABS.GENERAL,
      title: 'General',
      Icon: IconSettings2,
    },
    {
      id: SETTINGS_ADMIN_TABS.ENV_VARIABLES,
      title: 'Env Variables',
      Icon: IconVariable,
    },
  ];

  return (
    <>
      <StyledTabListContainer>
        <TabList
          tabs={tabs}
          tabListInstanceId={SETTINGS_ADMIN_TABS_ID}
          behaveAsLinks={true}
        />
      </StyledTabListContainer>
      <SettingsAdminTabContent />
    </>
  );
};
