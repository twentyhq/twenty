import { type ReactNode } from 'react';
import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';

type GranolaConnectionSectionProps = {
  children: ReactNode;
};

export const GranolaConnectionSection = ({
  children,
}: GranolaConnectionSectionProps) => (
  <Section>
    <H2Title
      title={t('Granola account')}
      description={t(
        'Requires Granola Business or Enterprise. Create a key in Granola under Settings → Connectors → API keys.',
      )}
    />
    <StyledSettingsSectionStack>{children}</StyledSettingsSectionStack>
  </Section>
);
