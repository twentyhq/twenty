import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconWand } from 'twenty-ui/icon';

import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';

type LinkedinPersonEnrichmentSectionProps = {
  isPersonEnrichmentEnabled: boolean;
  onChange: (isPersonEnrichmentEnabled: boolean) => void;
};

export const LinkedinPersonEnrichmentSection = ({
  isPersonEnrichmentEnabled,
  onChange,
}: LinkedinPersonEnrichmentSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Enrichment')}
      description={t('Complete People with their LinkedIn profile')}
    />
    <StyledSettingsCard>
      <SettingsOptionCardContentToggle
        Icon={IconWand}
        title={t('Enrich people from LinkedIn')}
        description={t(
          'Fill empty job title, city, email and X fields of matched or created people',
        )}
        checked={isPersonEnrichmentEnabled}
        onChange={onChange}
      />
    </StyledSettingsCard>
  </Section.Root>
);
