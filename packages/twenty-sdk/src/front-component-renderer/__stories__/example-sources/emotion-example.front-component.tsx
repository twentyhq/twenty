import styled from '@emotion/styled';
import { useState } from 'react';
import { defineFrontComponent } from '@/sdk';

const Container = styled.div`
  padding: 20px;
  background-color: #fefce8;
  border: 2px solid #facc15;
  border-radius: 12px;
  font-family: system-ui, sans-serif;
`;

const Heading = styled.h2`
  color: #854d0e;
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 12px;
`;

const Count = styled.p`
  font-size: 32px;
  font-weight: 800;
  color: #ca8a04;
  margin-bottom: 16px;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: #eab308;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
`;

const EmotionComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <Container data-testid="emotion-component">
      <Heading>Emotion Styled Component</Heading>
      <Count data-testid="emotion-count">Count: {count}</Count>
      <StyledButton
        data-testid="emotion-button"
        onClick={() => setCount((previous) => previous + 1)}
      >
        Increment
      </StyledButton>
    </Container>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-emotion-0000-0000-0000-000000000006',
  name: 'emotion-component',
  description: 'A front component using @emotion/styled',
  component: EmotionComponent,
});
