import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsDesktopDownloadSection } from '~/pages/settings/applications/tabs/SettingsDesktopDownloadSection';

export const SettingsDesktopApp = () => {
  const { t } = useLingui();
  return (
    <SettingsPageLayout
      title={t`Desktop app`}
      links={[{ children: <Trans>Desktop app</Trans> }]}
    >
      <SettingsPageContainer>
        <SettingsDesktopDownloadSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
