import * as React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  name: string;
  id: string;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const StyledContainer = styled.span`
  input[type='checkbox'] {
    accent-color: ${(props) => props.theme.blue};
    margin: 8px;
    height: 14px;
    width: 14px;
    cursor: pointer;
    user-select: none;
  }

  input[type='checkbox']::before {
    content: '';
    border: 1px solid ${(props) => props.theme.text40};
    width: 12px;
    height: 12px;
    border-radius: 2px;
    display: block;
  }

  input[type='checkbox']:hover::before {
    border: 1px solid ${(props) => props.theme.text80};
  }

  input[type='checkbox']:checked::before {
    border: 1px solid ${(props) => props.theme.blue};
  }
`;

function Checkbox({ name, id, checked, onChange, indeterminate }: OwnProps) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current === null) return;
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !checked && indeterminate;
    }
  }, [ref, indeterminate, checked]);

  return (
    <StyledContainer>
      <input
        ref={ref}
        type="checkbox"
        data-testid="input-checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
      />
    </StyledContainer>
  );
}

export default Checkbox;
