import { ColorSchemePicker, H2Title, Section } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

import { Trans, useLingui } from '@lingui/react/macro';
import { FeatureFlagKey } from '~/generated/graphql';
import { DateTimeSettings } from '~/pages/settings/profile/appearance/components/DateTimeSettings';
import { LocalePicker } from '~/pages/settings/profile/appearance/components/LocalePicker';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsExperience = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  const isLocalizationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsLocalizationEnabled,
  );

  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
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
          <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />
        </Section>
        <Section>
          <H2Title
            title={t`Date and time`}
            description={t`Configure how dates are displayed across the app`}
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
