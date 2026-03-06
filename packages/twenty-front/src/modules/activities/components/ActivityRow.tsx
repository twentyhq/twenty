import { styled } from '@linaria/react';
import React from 'react';
import { CardContent } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRowContentContainer = styled.div`
  > div {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    gap: ${themeCssVariables.spacing[2]};
    height: ${themeCssVariables.spacing[12]};
    overflow: hidden;
    padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[4]};
  }

  > div[data-clickable='false'] {
    cursor: default;
  }
`;

export const ActivityRow = ({
  children,
  onClick,
  disabled,
}: React.PropsWithChildren<{
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}>) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled !== true) {
      onClick?.(event);
    }
  };

  return (
    <StyledRowContentContainer>
      <CardContent onClick={handleClick} isClickable={disabled !== true}>
        {children}
      </CardContent>
    </StyledRowContentContainer>
  );
};
