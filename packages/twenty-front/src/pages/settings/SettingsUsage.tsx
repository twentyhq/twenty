import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsUsageAnalyticsSection } from '@/settings/usage/components/SettingsUsageAnalyticsSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';

export const SettingsUsage = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Usage`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Usage</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <SettingsUsageAnalyticsSection />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
