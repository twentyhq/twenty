import { useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsAI = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`AI`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`AI` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`AI Configuration`}
            description={t`Configure AI settings for your workspace`}
          />
          {/* AI settings content will go here */}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
