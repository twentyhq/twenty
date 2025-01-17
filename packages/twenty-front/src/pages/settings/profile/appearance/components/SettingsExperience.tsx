import { ColorSchemePicker, H2Title, Section } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

import { useLingui } from '@lingui/react/macro';
import { FeatureFlagKey } from '~/generated/graphql';
import { DateTimeSettings } from '~/pages/settings/profile/appearance/components/DateTimeSettings';
import { LocalePicker } from '~/pages/settings/profile/appearance/components/LocalePicker';

export const SettingsExperience = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  const isLocalizationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsLocalizationEnabled,
  );

  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title="Experience"
      links={[
        {
          children: 'User',
          href: getSettingsPagePath(SettingsPath.ProfilePage),
        },
        { children: 'Experience' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="Appearance" />
          <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />
        </Section>
        <Section>
          <H2Title
            title="Date and time"
            description="Configure how dates are displayed across the app"
          />
          <DateTimeSettings />
        </Section>

        {isLocalizationEnabled && (
          <Section>
            <H2Title
              title={t`Language`}
              description={t`Select your preferred language`}
            />
            <LocalePicker />
          </Section>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
