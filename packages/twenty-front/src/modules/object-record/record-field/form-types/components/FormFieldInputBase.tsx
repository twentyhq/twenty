import { InputLabel } from '@/ui/input/components/InputLabel';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-ui';

const LINE_HEIGHT = 24;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledRowContainer = styled.div<{
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

const StyledInputContainer = styled.div<{
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

type FormFieldInputBaseProps = {
  inputId?: string;
  label?: string;
  Input: React.ReactElement;
  RightElement?: React.ReactElement;
  multiline?: boolean;
};

export const FormFieldInputBase = ({
  inputId,
  label,
  Input,
  RightElement,
  multiline,
}: FormFieldInputBaseProps) => {
  return (
    <StyledContainer>
      {label ? <InputLabel htmlFor={inputId}>{label}</InputLabel> : null}

      <StyledRowContainer multiline={multiline}>
        <StyledInputContainer
          hasRightElement={isDefined(RightElement)}
          multiline={multiline}
        >
          {Input}
        </StyledInputContainer>

        {RightElement}
      </StyledRowContainer>
    </StyledContainer>
  );
};
