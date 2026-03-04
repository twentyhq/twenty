import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';

import DarkCoverImage from '@/settings/playground/assets/cover-dark.png';
import LightCoverImage from '@/settings/playground/assets/cover-light.png';
import { Card } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCard = styled(Card)`
  align-items: center;
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

type StyledSettingsApiPlaygroundCoverImageProps = {
  children?: ReactNode;
  className?: string;
};

export const StyledSettingsApiPlaygroundCoverImage = ({
  children,
  className,
}: StyledSettingsApiPlaygroundCoverImageProps) => {
  const { theme } = useContext(ThemeContext);
  const coverImage =
    theme.name === 'light'
      ? LightCoverImage.toString()
      : DarkCoverImage.toString();
  return (
    <StyledCard
      className={className}
      style={{ backgroundImage: `url('${coverImage}')` }}
    >
      {children}
    </StyledCard>
  );
};
