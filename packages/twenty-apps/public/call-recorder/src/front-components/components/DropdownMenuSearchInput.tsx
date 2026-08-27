import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDropdownMenuSearchInputContainer = styled.div`
  align-items: center;
  box-sizing: content-box;
  display: flex;
  flex-direction: row;
  min-height: calc(36px - 2 * ${() => themeCssVariables.spacing[2]});
  padding: ${() => themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledInput = styled.input`
  background-color: transparent;
  border: none;
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.md};
  outline: none;
  padding: 0 ${() => themeCssVariables.spacing[2]};
  width: 100%;

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${() => themeCssVariables.font.color.light};
    font-family: ${() => themeCssVariables.font.family};
    font-weight: ${() => themeCssVariables.font.weight.medium};
  }
`;

type DropdownMenuSearchInputProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export const DropdownMenuSearchInput = ({
  value,
  placeholder,
  onChange,
}: DropdownMenuSearchInputProps) => (
  <StyledDropdownMenuSearchInputContainer>
    <StyledInput
      autoFocus
      autoComplete="off"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </StyledDropdownMenuSearchInputContainer>
);
