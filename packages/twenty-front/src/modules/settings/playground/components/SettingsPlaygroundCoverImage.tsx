import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';

import DarkCoverImage from '@/settings/playground/assets/cover-dark.png';
import LightCoverImage from '@/settings/playground/assets/cover-light.png';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCoverContainer = styled.div`
  align-items: center;
  background-size: cover;
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  height: 153px;
  justify-content: center;
  margin-bottom: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[4]};
  position: relative;
`;

type StyledSettingsApiPlaygroundCoverImageProps = {
  children?: ReactNode;
  className?: string;
};

export const StyledSettingsApiPlaygroundCoverImage = ({
  children,
  className,
}: StyledSettingsApiPlaygroundCoverImageProps) => {
  const { colorScheme } = useContext(ThemeContext);

  const coverImage =
    colorScheme === 'light'
      ? LightCoverImage.toString()
      : DarkCoverImage.toString();
  return (
    <StyledCoverContainer
      className={className}
      style={{ backgroundImage: `url('${coverImage}')` }}
    >
      {children}
    </StyledCoverContainer>
  );
};
