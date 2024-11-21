import styled from '@emotion/styled';

const LINE_HEIGHT = 24;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledInputContainer = styled.div<{
  multiline?: boolean;
}>`
  display: flex;
  flex-direction: row;
  position: relative;
  line-height: ${({ multiline }) => (multiline ? `${LINE_HEIGHT}px` : 'auto')};
  min-height: ${({ multiline }) =>
    multiline ? `${3 * LINE_HEIGHT}px` : undefined};
  max-height: ${({ multiline }) =>
    multiline ? `${5 * LINE_HEIGHT}px` : undefined};
`;

export const StyledInputContainer2 = styled.div<{
  multiline?: boolean;
  readonly?: boolean;
}>`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-bottom-right-radius: ${({ multiline, theme }) =>
    multiline ? theme.border.radius.sm : 'none'};
  border-right: ${({ multiline }) => (multiline ? 'auto' : 'none')};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-top-right-radius: ${({ multiline, theme }) =>
    multiline ? theme.border.radius.sm : 'none'};
  box-sizing: border-box;
  display: flex;
  overflow: ${({ multiline }) => (multiline ? 'auto' : 'hidden')};
  width: 100%;
`;

type FormFieldInputProps<T> = {
  Input: React.ReactElement;
  RightElement?: React.ReactElement;
  multiline?: boolean;
};

export const FormFieldInput = ({
  Input,
  RightElement,
  multiline,
}: FormFieldInputProps<unknown>) => {
  return (
    <StyledContainer>
      <StyledInputContainer multiline={multiline}>
        <StyledInputContainer2 multiline={multiline}>
          {Input}
        </StyledInputContainer2>

        {RightElement}
      </StyledInputContainer>
    </StyledContainer>
  );
};
