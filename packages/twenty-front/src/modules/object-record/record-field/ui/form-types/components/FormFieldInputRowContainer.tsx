import { styled } from '@linaria/react';

export const LINE_HEIGHT = 24;

const StyledFormFieldInputRowContainer = styled.div<{
  multiline?: boolean;
  maxHeight?: number;
}>`
  display: flex;
  flex-direction: row;
  position: relative;

  height: ${({ multiline }) => (multiline ? 'auto' : '32px')};
  line-height: ${({ multiline }) =>
    multiline ? `${LINE_HEIGHT}px` : 'normal'};
  max-height: ${({ multiline, maxHeight }) =>
    multiline ? `${maxHeight ?? 5 * LINE_HEIGHT}px` : 'none'};
  min-height: ${({ multiline }) =>
    multiline ? `${3 * LINE_HEIGHT}px` : 'auto'};
`;

export const FormFieldInputRowContainer = StyledFormFieldInputRowContainer;
