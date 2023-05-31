import * as React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  name: string;
  id: string;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const StyledContainer = styled.div`
  width: 32px;
  height: 32px;
  margin-left: -${(props) => props.theme.table.sideMarginInPx}px;
  padding-left: ${(props) => props.theme.table.sideMarginInPx}px;

  cursor: pointer;

  input[type='checkbox'] {
    accent-color: ${(props) => props.theme.blue};
    margin: 9px;
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (inputRef.current === null) return;
    if (typeof indeterminate === 'boolean') {
      inputRef.current.indeterminate = !checked && indeterminate;
    }
  }, [inputRef, indeterminate, checked]);

  function handleContainerClick(event: React.MouseEvent<HTMLDivElement>) {
    if (
      inputRef.current &&
      containerRef.current &&
      event.target === containerRef.current
    ) {
      inputRef.current.click();
    }
  }

  return (
    <StyledContainer
      ref={containerRef}
      onClick={handleContainerClick}
      data-testid="input-checkbox-container"
    >
      <input
        ref={inputRef}
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
