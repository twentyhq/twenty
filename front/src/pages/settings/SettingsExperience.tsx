import styled from '@emotion/styled';

import { ColorSchemePicker } from '@/ui/color-scheme/components/ColorSchemePicker';
import { IconSettings } from '@/ui/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/components/SubMenuTopBarContainer';
import { Section } from '@/ui/section/components/Section';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { H1Title } from '@/ui/typography/components/H1Title';
import { H2Title } from '@/ui/typography/components/H2Title';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(8)};
  padding-bottom: ${({ theme }) => theme.spacing(10)};
  width: 350px;
`;

export function SettingsExperience() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <SubMenuTopBarContainer
      Icon={IconSettings}
      iconProps={{ size: 16 }}
      title="Settings"
    >
      <StyledContainer>
        <H1Title title="Experience" />
        <Section>
          <H2Title title="Appearance" />
          <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />
        </Section>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
}
