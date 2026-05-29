import { styled } from '@linaria/react';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import customizeIllustrationDark from '~/pages/settings/layout/assets/customize-illustration-dark.png';
import customizeIllustrationLight from '~/pages/settings/layout/assets/customize-illustration-light.png';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  height: 192px;
  overflow: hidden;
  position: relative;
`;

const StyledImage = styled.img`
  display: block;
  height: 100%;
  inset: 0;
  object-fit: cover;
  object-position: center top;
  position: absolute;
  width: 100%;
`;

const StyledOverlay = styled.div`
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
`;

type SettingsLayoutCoverImageProps = {
  overlay?: React.ReactNode;
};

export const SettingsLayoutCoverImage = ({
  overlay,
}: SettingsLayoutCoverImageProps) => {
  const { theme } = useContext(ThemeContext);
  const src =
    theme.name === 'light'
      ? customizeIllustrationLight
      : customizeIllustrationDark;

  return (
    <StyledContainer>
      <StyledImage src={src} alt="" aria-hidden />
      {overlay && <StyledOverlay>{overlay}</StyledOverlay>}
    </StyledContainer>
  );
};
