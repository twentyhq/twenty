import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledFormFieldInputInputContainer = styled.div<{
  hasRightElement: boolean;
  multiline?: boolean;
  readonly?: boolean;
}>`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.sm};

  ${({ multiline, hasRightElement, theme }) =>
    multiline || !hasRightElement
      ? css`
          border-right: auto;
          border-bottom-right-radius: ${theme.border.radius.sm};
          border-top-right-radius: ${theme.border.radius.sm};
        `
      : css`
          border-right: none;
          border-bottom-right-radius: none;
          border-top-right-radius: none;
        `}

  box-sizing: border-box;
  display: flex;
  overflow: ${({ multiline }) => (multiline ? 'auto' : 'hidden')};
  width: 100%;
`;

export const FormFieldInputInputContainer = StyledFormFieldInputInputContainer;
