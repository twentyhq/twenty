import styled from '@emotion/styled';

import { IconSettings } from '@/ui/Display/Icon';
import { H1Title } from '@/ui/Display/Typography/components/H1Title';
import { H2Title } from '@/ui/Display/Typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/Layout/Page/SubMenuTopBarContainer';
import { Section } from '@/ui/Layout/Section/components/Section';
import { ColorSchemePicker } from '@/ui/Themes/color-scheme/components/ColorSchemePicker';
import { useColorScheme } from '@/ui/Themes/theme/hooks/useColorScheme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(8)};
  padding-bottom: ${({ theme }) => theme.spacing(10)};
  width: 350px;
`;

export const SettingsExperience = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <StyledContainer>
        <H1Title title="Experience" />
        <Section>
          <H2Title title="Appearance" />
          <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />
        </Section>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
