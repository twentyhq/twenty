import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsCustomDomain } from '@/settings/domains/components/SettingsCustomDomain';
import { SettingsSubdomain } from '@/settings/domains/components/SettingsSubdomain';
import { isCloudflareIntegrationEnabledState } from '@/client-config/states/isCloudflareIntegrationEnabledState';

export const SettingsDomain = () => {
  const { t } = useLingui();
  const isCloudflareIntegrationEnabled = useAtomStateValue(
    isCloudflareIntegrationEnabledState,
  );

  return (
    <SubMenuTopBarContainer
      title={t`Domain`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Domains</Trans>,
          href: getSettingsPath(SettingsPath.Domains),
        },
        { children: <Trans>Domain</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <SettingsSubdomain />
        {isCloudflareIntegrationEnabled && <SettingsCustomDomain />}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
