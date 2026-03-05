import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';

import DarkCoverImage from '@/settings/playground/assets/cover-dark.png';
import LightCoverImage from '@/settings/playground/assets/cover-light.png';
import { Card } from 'twenty-ui/layout';
import {
  ColorSchemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledCardContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[4]};

  > div {
    align-items: center;
    background-size: cover;
    border-radius: ${themeCssVariables.border.radius.md};
    box-sizing: border-box;
    display: flex;
    height: 153px;
    justify-content: center;
    position: relative;
  }
`;

type StyledSettingsApiPlaygroundCoverImageProps = {
  children?: ReactNode;
  className?: string;
};

export const StyledSettingsApiPlaygroundCoverImage = ({
  children,
  className,
}: StyledSettingsApiPlaygroundCoverImageProps) => {
  const { colorScheme } = useContext(ColorSchemeContext);

  const coverImage =
    colorScheme === 'light'
      ? LightCoverImage.toString()
      : DarkCoverImage.toString();
  return (
    <StyledCardContainer className={className}>
      <Card style={{ backgroundImage: `url('${coverImage}')` }}>
        {children}
      </Card>
    </StyledCardContainer>
  );
};
