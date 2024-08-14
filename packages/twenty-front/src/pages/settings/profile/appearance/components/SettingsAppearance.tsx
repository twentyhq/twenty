import { H2Title, IconColorSwatch } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ColorSchemePicker } from '@/ui/input/color-scheme/components/ColorSchemePicker';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { DateTimeSettings } from '~/pages/settings/profile/appearance/components/DateTimeSettings';

export const SettingsAppearance = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <SubMenuTopBarContainer Icon={IconColorSwatch} title="Appearance">
      <SettingsPageContainer>
        <Section>
          <H2Title title="Theme" />
          <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />
        </Section>
        <Section>
          <H2Title
            title="Date and time"
            description="Configure how dates are displayed across the app"
          />
          <DateTimeSettings />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
