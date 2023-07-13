import * as React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (newCheckedValue: boolean) => void;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;

  input[type='checkbox'] {
    accent-color: ${({ theme }) => theme.color.blue};
    cursor: pointer;
    height: 14px;
    margin: 2px;
    user-select: none;
    width: 14px;
  }

  input[type='checkbox']::before {
    border: 1px solid ${({ theme }) => theme.font.color.tertiary};
    border-radius: ${({ theme }) => theme.border.radius.xs};
    content: '';
    display: block;
    height: 12px;
    width: 12px;
  }

  input[type='checkbox']:hover::before {
    border: 1px solid ${({ theme }) => theme.font.color.primary};
  }

  input[type='checkbox']:checked::before {
    border: 1px solid ${({ theme }) => theme.color.blue};
  }
`;

export function Checkbox({ checked, onChange, indeterminate }: OwnProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current === null) return;
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !checked && indeterminate;
    }
  }, [ref, indeterminate, checked]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange?.(event.target.checked);
  }

  return (
    <StyledContainer>
      <input
        ref={ref}
        type="checkbox"
        data-testid="input-checkbox"
        checked={checked}
        onChange={handleChange}
      />
    </StyledContainer>
  );
}
