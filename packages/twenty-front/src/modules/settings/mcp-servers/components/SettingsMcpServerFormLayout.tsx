import { type ReactNode } from 'react';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { getSettingsAiBreadcrumbLinks } from '@/settings/ai/utils/getSettingsAiBreadcrumbLinks';

type SettingsMcpServerFormLayoutProps = {
  title: string;
  breadcrumbTitle: string;
  actionButton: ReactNode;
  children: ReactNode;
};

export const SettingsMcpServerFormLayout = ({
  title,
  breadcrumbTitle,
  actionButton,
  children,
}: SettingsMcpServerFormLayoutProps) => (
  <SettingsPageLayout
    title={title}
    links={getSettingsAiBreadcrumbLinks({
      currentPageLabel: breadcrumbTitle,
      tabId: SETTINGS_AI_TABS.TABS_IDS.TOOLS,
    })}
    actionButton={actionButton}
  >
    <SettingsPageContainer>{children}</SettingsPageContainer>
  </SettingsPageLayout>
);
