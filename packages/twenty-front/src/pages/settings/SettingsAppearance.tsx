import styled from '@emotion/styled';
import { IconSettings } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { ColorSchemePicker } from '@/ui/input/color-scheme/components/ColorSchemePicker';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsAppearance = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <StyledH1Title title="Appearance" />
        <Section>
          <H2Title title="Theme" />
          <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
