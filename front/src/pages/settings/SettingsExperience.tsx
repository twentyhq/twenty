import styled from '@emotion/styled';

import { ColorSchemePicker } from '@/ui/color-scheme/components/ColorSchemePicker';
import { NoTopBarContainer } from '@/ui/layout/components/NoTopBarContainer';
import { useColorScheme } from '@/ui/themes/hooks/useColorScheme';
import { MainSectionTitle } from '@/ui/title/components/MainSectionTitle';
import { SubSectionTitle } from '@/ui/title/components/SubSectionTitle';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(8)};
  padding-bottom: ${({ theme }) => theme.spacing(10)};
  width: 350px;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(8)};
  }
`;

export function SettingsExperience() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <NoTopBarContainer>
      <div>
        <StyledContainer>
          <MainSectionTitle>Experience</MainSectionTitle>
          <SubSectionTitle title="Appearance" />
          <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />
        </StyledContainer>
      </div>
    </NoTopBarContainer>
  );
}
