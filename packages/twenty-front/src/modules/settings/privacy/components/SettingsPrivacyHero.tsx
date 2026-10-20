import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconExternalLink, IconShield } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsDiscoveryHeroCardFooter } from '@/settings/components/SettingsDiscoveryHeroCardFooter';
import euCoverDark from '@/settings/privacy/assets/cover-dark.png';
import euCoverLight from '@/settings/privacy/assets/cover-light.png';
import globalCoverDark from '@/settings/privacy/assets/global-cover-dark.png';
import globalCoverLight from '@/settings/privacy/assets/global-cover-light.png';
import { TWENTY_TRUST_CENTER_URLS } from '@/settings/privacy/constants/TwentyTrustCenterUrls';
import { type PrivacyAudience } from '@/settings/privacy/types/PrivacyAudience';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

const SETTINGS_PRIVACY_HERO_INSTANCE_ID_PREFIX = 'settings-privacy-hero';

type SettingsPrivacyHeroProps = {
  privacyAudience: PrivacyAudience;
};

export const SettingsPrivacyHero = ({
  privacyAudience,
}: SettingsPrivacyHeroProps) => {
  const { t } = useLingui();

  const heroByAudience = {
    eu: {
      lightSrc: euCoverLight,
      darkSrc: euCoverDark,
      title: t`Your data stays in the EU`,
      description: t`Workspace data, files and backups are stored in Frankfurt, Germany.`,
    },
    global: {
      lightSrc: globalCoverLight,
      darkSrc: globalCoverDark,
      title: t`Security you can verify`,
      description: t`SOC 2 audited controls, encryption in transit and at rest, and code anyone can review.`,
    },
  } satisfies Record<PrivacyAudience, Record<string, string>>;

  const { lightSrc, darkSrc, title, description } =
    heroByAudience[privacyAudience];

  return (
    <Section.Root>
      <SettingsDiscoveryHeroCard
        lightSrc={lightSrc}
        darkSrc={darkSrc}
        instanceIdPrefix={SETTINGS_PRIVACY_HERO_INSTANCE_ID_PREFIX}
        tabs={[]}
        footer={
          <SettingsDiscoveryHeroCardFooter
            Icon={IconShield}
            title={title}
            description={description}
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
