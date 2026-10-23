import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconExternalLink, IconShield } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

import { SettingsDiscoveryHeroCardFooter } from '@/settings/components/SettingsDiscoveryHeroCardFooter';
import { TWENTY_TRUST_CENTER_URLS } from '@/settings/privacy/constants/TwentyTrustCenterUrls';
import { type PrivacyAudience } from '@/settings/privacy/types/PrivacyAudience';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

type SettingsPrivacyHeroProps = {
  privacyAudience: PrivacyAudience;
};

export const SettingsPrivacyHero = ({
  privacyAudience,
}: SettingsPrivacyHeroProps) => {
  const { t } = useLingui();

  const heroByAudience = {
    eu: {
      title: t`Your data stays in the EU`,
      description: t`Workspace data, files and backups are stored in Frankfurt, Germany.`,
    },
    global: {
      title: t`Security you can verify`,
      description: t`SOC 2 audited controls, encryption in transit and at rest, and code anyone can review.`,
    },
  } satisfies Record<PrivacyAudience, Record<string, string>>;

  const { title, description } = heroByAudience[privacyAudience];

  return (
    <Section.Root>
      <Card.Root>
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
      </Card.Root>
    </Section.Root>
  );
};
