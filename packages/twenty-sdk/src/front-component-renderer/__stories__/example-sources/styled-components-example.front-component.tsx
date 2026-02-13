import { useState } from 'react';
import styled from 'styled-components';
import { defineFrontComponent } from '@/sdk';

const Container = styled.div`
  padding: 20px;
  background-color: #fdf2f8;
  border: 2px solid #ec4899;
  border-radius: 12px;
  font-family: system-ui, sans-serif;
`;

const Heading = styled.h2`
  color: #9d174d;
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 12px;
`;

const Count = styled.p`
  font-size: 32px;
  font-weight: 800;
  color: #db2777;
  margin-bottom: 16px;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: #ec4899;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
`;

const StyledComponentsComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <Container data-testid="styled-components-component">
      <Heading>Styled Components Example</Heading>
      <Count data-testid="styled-components-count">Count: {count}</Count>
      <StyledButton
        data-testid="styled-components-button"
        onClick={() => setCount((previous) => previous + 1)}
      >
        Increment
      </StyledButton>
    </Container>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-styled-0000-0000-0000-000000000007',
  name: 'styled-components-component',
  description: 'A front component using styled-components',
  component: StyledComponentsComponent,
});
