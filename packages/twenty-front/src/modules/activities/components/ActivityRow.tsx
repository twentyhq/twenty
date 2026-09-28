import { styled } from '@linaria/react';
import React from 'react';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRowContentContainer = styled.div`
  > div {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    gap: ${themeCssVariables.spacing[2]};
    height: ${themeCssVariables.spacing[12]};
    padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[4]};
  }

  > div[data-clickable='false'] {
    cursor: default;
  }

  > div[data-hover-highlight]:hover {
    background: ${themeCssVariables.background.transparent.lighter};
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
      <Card.Content
        onClick={handleClick}
        isClickable={disabled !== true}
        hasHoverHighlight={disabled !== true}
      >
        {children}
      </Card.Content>
    </StyledRowContentContainer>
  );
};
