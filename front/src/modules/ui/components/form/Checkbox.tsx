import * as React from 'react';
import styled from '@emotion/styled';

import { IconCheck } from '@/ui/icons/index';

type OwnProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
};

const StyledContainer = styled.div`
  align-items: center;

  display: flex;
  justify-content: center;
  position: relative;

  input[type='checkbox'] {
    accent-color: ${({ theme }) => theme.color.blue};
    cursor: pointer;
    height: 14px;
    margin: 2px;
    user-select: none;
    width: 14px;
  }

  input[type='checkbox']::before {
    background-color: ${({ theme }) => theme.background.primary};
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

  svg {
    background: ${({ theme }) => theme.color.blue};
    color: white;
    height: 12px;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
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

  return (
    <StyledContainer onClick={onChange}>
      <input
        ref={ref}
        type="checkbox"
        data-testid="input-checkbox"
        checked={checked}
      />
      {checked && <IconCheck />}
    </StyledContainer>
  );
}
