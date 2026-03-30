import styled from '@emotion/styled';
import { useState } from 'react';
import { defineFrontComponent } from '@/sdk';

const Card = styled.div`
  padding: 24px;
  background-color: #fefce8;
  border: 2px solid #facc15;
  border-radius: 12px;
  font-family: system-ui, sans-serif;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Heading = styled.h2`
  color: #854d0e;
  font-weight: 700;
  font-size: 18px;
  margin: 0;
`;

const Description = styled.p`
  color: #a16207;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`;

const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Chip = styled.span<{ color: string }>`
  display: inline-block;
  padding: 4px 10px;
  background-color: ${({ color }) => color};
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const Count = styled.p`
  font-size: 24px;
  font-weight: 800;
  color: #ca8a04;
  margin: 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const StyledButton = styled.button<{ variant?: 'outline' }>`
  padding: 8px 16px;
  background-color: ${({ variant }) =>
    variant === 'outline' ? 'transparent' : '#eab308'};
  color: ${({ variant }) => (variant === 'outline' ? '#854d0e' : 'white')};
  border: ${({ variant }) =>
    variant === 'outline' ? '1px solid #d4a90a' : 'none'};
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
`;

const EmotionComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <Card data-testid="emotion-component">
      <Heading>Emotion</Heading>
      <Description>
        CSS-in-JS library with tagged template literals and object styles.
      </Description>
      <ChipRow>
        <Chip color="#eab308">Badge</Chip>
        <Chip color="#a855f7">Styled</Chip>
        <Chip color="#f97316">Outline</Chip>
      </ChipRow>
      <Count data-testid="emotion-count">Count: {count}</Count>
      <ButtonRow>
        <StyledButton
          data-testid="emotion-button"
          onClick={() => setCount((previous) => previous + 1)}
        >
          Increment
        </StyledButton>
        <StyledButton variant="outline" onClick={() => setCount(0)}>
          Reset
        </StyledButton>
      </ButtonRow>
    </Card>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-emotion-0000-0000-0000-000000000006',
  name: 'emotion-component',
  description: 'A front component using @emotion/styled',
  component: EmotionComponent,
});
