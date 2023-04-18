import * as React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  name: string;
  id: string;
};

const StyledContainer = styled.span`
  input[type='checkbox'] {
    accent-color: ${(props) => props.theme.purple};
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
