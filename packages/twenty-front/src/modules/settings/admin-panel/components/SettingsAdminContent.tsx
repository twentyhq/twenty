// components/SettingsAdminContent.tsx
import { SettingsAdminEnvVariables } from '@/settings/admin-panel/components/SettingsAdminEnvVariables';
import { SettingsAdminGeneral } from '@/settings/admin-panel/components/SettingsAdminGeneral';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import styled from '@emotion/styled';
import { IconSettings2, IconVariable } from 'twenty-ui';

export const SETTINGS_ADMIN_TABS = {
  GENERAL: 'general',
  ENVIRONMENT: 'environment',
};

const SETTINGS_ADMIN_TOP_LEVEL_TAB_ID = 'settings-admin-top-level';

const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAdminContent = () => {
  const { activeTabId } = useTabList(SETTINGS_ADMIN_TOP_LEVEL_TAB_ID);

  const tabs = [
    {
      id: SETTINGS_ADMIN_TABS.GENERAL,
      title: 'General',
      Icon: IconSettings2,
    },
    {
      id: SETTINGS_ADMIN_TABS.ENVIRONMENT,
      title: 'Env Variables',
      Icon: IconVariable,
    },
  ];

  const renderContent = () => {
    switch (activeTabId) {
      case SETTINGS_ADMIN_TABS.GENERAL:
        return <SettingsAdminGeneral />;
      case SETTINGS_ADMIN_TABS.ENVIRONMENT:
        return <SettingsAdminEnvVariables />;
      default:
        return null;
    }
  };

  return (
    <>
      <StyledTabListContainer>
        <TabList
          tabs={tabs}
          tabListInstanceId={SETTINGS_ADMIN_TOP_LEVEL_TAB_ID}
          behaveAsLinks={false}
        />
      </StyledTabListContainer>

      {renderContent()}
    </>
  );
};
