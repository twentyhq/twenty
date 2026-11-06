import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconExternalLink, IconShield } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

import { SettingsDiscoveryHeroCardFooter } from '@/settings/components/SettingsDiscoveryHeroCardFooter';
import { TWENTY_TRUST_CENTER_URLS } from '@/settings/privacy/constants/TwentyTrustCenterUrls';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

export const SettingsPrivacyHero = () => {
  const { t } = useLingui();

  return (
    <Section.Root>
      <Card.Root>
        <SettingsDiscoveryHeroCardFooter
          Icon={IconShield}
          title={t`Security you can verify`}
          description={t`SOC 2 audited controls, encryption in transit and at rest, and code anyone can review.`}
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
