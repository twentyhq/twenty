import { type ReactNode } from 'react';
import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components';

import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';

type GranolaConnectionSectionProps = {
  children: ReactNode;
};

export const GranolaConnectionSection = ({
  children,
}: GranolaConnectionSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Granola account')}
      description={t(
        'Requires Granola Business or Enterprise. Create a key in Granola under Settings → Connectors → API keys.',
      )}
    />
    <StyledSettingsSectionStack>{children}</StyledSettingsSectionStack>
  </Section.Root>
);
