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
    height: 16px;
    width: 16px;
  }

  input[type='checkbox']::before {
    content: '';
    border: 1px solid black;
    width: 14px;
    height: 14px;
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
      <input type="checkbox" id={id} name={name}></input>
    </StyledContainer>
  );
}

export default Checkbox;
