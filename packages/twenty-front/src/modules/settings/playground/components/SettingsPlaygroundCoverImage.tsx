import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';

import DarkCoverImage from '@/settings/playground/assets/cover-dark.png';
import LightCoverImage from '@/settings/playground/assets/cover-light.png';
import { Card } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCoverContainer = styled.div`
  align-items: center;
  background-size: cover;
  display: flex;
  height: 153px;
  justify-content: center;
  position: relative;
`;

const StyledCardWrapper = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[4]};
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

  const coverImage = colorScheme === 'light' ? LightCoverImage : DarkCoverImage;

  return (
    <StyledCardWrapper className={className}>
      <Card rounded>
        <StyledCoverContainer
          style={{ backgroundImage: `url('${coverImage}')` }}
        >
          {children}
        </StyledCoverContainer>
      </Card>
    </StyledCardWrapper>
  );
};
