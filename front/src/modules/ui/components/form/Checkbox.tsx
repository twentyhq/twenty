import * as React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  name?: string;
  id?: string;
  checked?: boolean;
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
    border-radius: 2px;
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

export function Checkbox({
  name,
  id,
  checked,
  onChange,
  indeterminate,
}: OwnProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current === null) return;
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !checked && indeterminate;
    }
  }, [ref, indeterminate, checked]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (onChange) {
      onChange(event.target.checked);
    }
  }

  return (
    <StyledContainer>
      <input
        ref={ref}
        type="checkbox"
        data-testid="input-checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={handleInputChange}
      />
    </StyledContainer>
  );
}
