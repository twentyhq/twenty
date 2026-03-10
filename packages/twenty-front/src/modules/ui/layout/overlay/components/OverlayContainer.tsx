import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

// oxlint-disable-next-line twenty/styled-components-prefixed-with-styled
export const OverlayContainer = styled.div<{
  borderRadius?: 'sm' | 'md';
  hasDangerBorder?: boolean;
}>`
  align-items: center;
  backdrop-filter: ${themeCssVariables.blur.medium};

  background: ${themeCssVariables.background.transparent.primary};

  border: 1px solid
    ${({ hasDangerBorder }) =>
      themeCssVariables.border.color[hasDangerBorder ? 'danger' : 'medium']};

  border-radius: ${({ borderRadius }) =>
    themeCssVariables.border.radius[borderRadius ?? 'md']};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;

  overflow: hidden;

  z-index: 30;
`;
