import styled from '@emotion/styled';
import {
  ColorSchemePicker,
  H1Title,
  H2Title,
  IconSettings,
  Section,
} from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
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
