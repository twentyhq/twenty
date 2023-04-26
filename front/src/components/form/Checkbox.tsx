import * as React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  name: string;
  id: string;
};

const StyledContainer = styled.span`
  input[type='checkbox'] {
    accent-color: ${(props) => props.theme.blue};
    margin: 8px;
    height: 14px;
    width: 14px;
  }

  input[type='checkbox']::before {
    content: '';
    border: 1px solid ${(props) => props.theme.text80};
    width: 12px;
    height: 12px;
    border-radius: 2px;
    display: block;
  }

  input[type='checkbox']:checked::before {
    border: 1px solid ${(props) => props.theme.blue};
  }
`;

function Checkbox({ name, id }: OwnProps) {
  return (
    <StyledContainer>
      <input
        type="checkbox"
        data-testid="input-checkbox"
        id={id}
        name={name}
      ></input>
    </StyledContainer>
  );
}

export default Checkbox;
