import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const LINE_HEIGHT = 24;

const StyledFormFieldInputRowContainer = styled.div<{
  multiline?: boolean;
}>`
  display: flex;
  flex-direction: row;
  position: relative;

  ${({ multiline }) =>
    multiline
      ? css`
          line-height: ${LINE_HEIGHT}px;
          min-height: ${3 * LINE_HEIGHT}px;
          max-height: ${5 * LINE_HEIGHT}px;
        `
      : css`
          height: 32px;
        `}
`;

export const FormFieldInputRowContainer = StyledFormFieldInputRowContainer;
