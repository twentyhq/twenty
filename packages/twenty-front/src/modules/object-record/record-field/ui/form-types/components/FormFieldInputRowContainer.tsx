import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const LINE_HEIGHT = 24;

const StyledFormFieldInputRowContainer = styled.div<{
  multiline?: boolean;
  maxHeight?: number;
}>`
  display: flex;
  flex-direction: row;
  position: relative;

  ${({ multiline, maxHeight }) =>
    multiline
      ? css`
          line-height: ${LINE_HEIGHT}px;
          min-height: ${3 * LINE_HEIGHT}px;
          max-height: ${maxHeight ?? 5 * LINE_HEIGHT}px;
        `
      : css`
          height: 32px;
        `}
`;

export const FormFieldInputRowContainer = StyledFormFieldInputRowContainer;
