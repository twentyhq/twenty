import { styled } from '@linaria/react';
import { useContext } from 'react';

import DarkCoverImage from '@/settings/playground/assets/cover-dark.png';
import LightCoverImage from '@/settings/playground/assets/cover-light.png';
import { Card } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCard = styled(Card)<{ backgroundImageUrl: string }>`
  align-items: center;
  background-image: ${({ backgroundImageUrl }) =>
    `url('${backgroundImageUrl}')`};
  background-size: cover;
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  height: 153px;
  justify-content: center;
  position: relative;
  margin-top: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

export const StyledSettingsApiPlaygroundCoverImage = ({
  children,
  ...props
}: StyledSettingsApiPlaygroundCoverImageProps<typeof Card>) => {
  const { theme } = useContext(ThemeContext);
  const coverImage =
    theme.name === 'light'
      ? LightCoverImage.toString()
      : DarkCoverImage.toString();
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledCard {...props} backgroundImageUrl={coverImage}>
      {children}
    </StyledCard>
  );
};
