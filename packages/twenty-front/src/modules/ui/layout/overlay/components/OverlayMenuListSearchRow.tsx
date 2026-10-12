import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type InputHTMLAttributes } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSearchRow = styled.div`
  align-items: center;
  box-sizing: content-box;
  display: flex;
  min-height: 20px;
  padding: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledInput = styled.input`
  background-color: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: inherit;
  font-weight: inherit;
  outline: none;
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
  width: 100%;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.medium};
  }
`;

type OverlayMenuListSearchRowProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'placeholder'
>;

const focusSearchInput = (input: HTMLInputElement | null) => {
  input?.focus({ preventScroll: true });
};

export const OverlayMenuListSearchRow = ({
  value,
  onChange,
  placeholder = t`Search`,
}: OverlayMenuListSearchRowProps) => {
  return (
    <StyledSearchRow>
      <StyledInput
        ref={focusSearchInput}
        autoComplete="off"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </StyledSearchRow>
  );
};
