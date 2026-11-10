import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';

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
}: SettingsMcpServerFormLayoutProps) => {
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={title}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`AI`,
          href: getSettingsPath(
            SettingsPath.AI,
            undefined,
            undefined,
            SETTINGS_AI_TABS.TABS_IDS.TOOLS,
          ),
        },
        { children: breadcrumbTitle },
      ]}
      actionButton={actionButton}
    >
      <SettingsPageContainer>{children}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
