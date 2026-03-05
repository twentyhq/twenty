import { styled } from '@linaria/react';
import React from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledInputErrorHelper = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
  position: absolute;
  margin-top: 1px;
`;

export const InputErrorHelper = ({
  children,
}: {
  children?: React.ReactNode;
}) => (
  <div>
    {Boolean(children) && (
      <StyledInputErrorHelper aria-live="polite">
        {children}
      </StyledInputErrorHelper>
    )}
  </div>
);
