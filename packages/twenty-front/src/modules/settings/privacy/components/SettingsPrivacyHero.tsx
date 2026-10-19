import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconExternalLink, IconShield } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsDiscoveryHeroCardFooter } from '@/settings/components/SettingsDiscoveryHeroCardFooter';
import coverDark from '@/settings/privacy/assets/cover-dark.png';
import coverLight from '@/settings/privacy/assets/cover-light.png';
import { TWENTY_TRUST_CENTER_URLS } from '@/settings/privacy/constants/TwentyTrustCenterUrls';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

const SETTINGS_PRIVACY_HERO_INSTANCE_ID_PREFIX = 'settings-privacy-hero';

export const SettingsPrivacyHero = () => {
  const { t } = useLingui();

  return (
    <Section.Root>
      <SettingsDiscoveryHeroCard
        lightSrc={coverLight}
        darkSrc={coverDark}
        instanceIdPrefix={SETTINGS_PRIVACY_HERO_INSTANCE_ID_PREFIX}
        tabs={[]}
        footer={
          <SettingsDiscoveryHeroCardFooter
            Icon={IconShield}
            title={t`Your data stays in the EU`}
            description={t`Workspace data, files and backups are stored in Frankfurt, Germany.`}
            action={
              <Button
                size="sm"
                variant="outline"
                startIcon={<IconExternalLink />}
                onClick={() => openUrlInNewTab(TWENTY_TRUST_CENTER_URLS.home)}
              >{t`Trust Center`}</Button>
            }
          />
        }
      />
    </Section.Root>
  );
};
