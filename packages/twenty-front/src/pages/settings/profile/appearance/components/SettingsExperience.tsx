import { styled } from '@linaria/react';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { FormatPreferencesSettings } from '@/settings/experience/components/FormatPreferencesSettings';
import { UiScalePicker } from '@/settings/experience/components/UiScalePicker';
import { OpenRecordInPreferencePicker } from '@/settings/experience/components/OpenRecordInPreferencePicker';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/typography';
import { ColorSchemePicker } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { LocalePicker } from '~/pages/settings/profile/appearance/components/LocalePicker';

const StyledInterfaceControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsExperience = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={t`Experience`}
      links={[
        {
          children: <Trans>User</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: <Trans>Experience</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t`Appearance`} />
          <ColorSchemePicker
            value={colorScheme}
            onChange={setColorScheme}
            lightLabel={t`Light`}
            darkLabel={t`Dark`}
            systemLabel={t`System settings`}
          />
        </Section>

        <Section>
          <H2Title
            title={t`Interface`}
            description={t`Select your language and adjust the size of the interface`}
          />
          <StyledInterfaceControls>
            <LocalePicker />
            <UiScalePicker />
          </StyledInterfaceControls>
        </Section>

        <Section>
          <H2Title
            title={t`Navigation`}
            description={t`Choose where records open by default. Some objects may use a workspace setting`}
          />
          <OpenRecordInPreferencePicker />
        </Section>

        <Section>
          <H2Title
            title={t`Formats`}
            description={t`Configure date, time, number, timezone, and calendar start day`}
          />
          <FormatPreferencesSettings />
        </Section>
        {/* Unified into FormatPreferencesSettings */}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
