import { useState } from 'react';
import styled from 'styled-components';
import { defineFrontComponent } from '@/sdk';

const Card = styled.div`
  padding: 24px;
  background-color: #fdf2f8;
  border: 2px solid #ec4899;
  border-radius: 12px;
  font-family: system-ui, sans-serif;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Heading = styled.h2`
  color: #9d174d;
  font-weight: 700;
  font-size: 18px;
  margin: 0;
`;

const Description = styled.p`
  color: #be185d;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`;

const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Chip = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 4px 10px;
  background-color: ${({ $color }) => $color};
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const Count = styled.p`
  font-size: 24px;
  font-weight: 800;
  color: #db2777;
  margin: 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const StyledButton = styled.button<{ $variant?: 'outline' }>`
  padding: 8px 16px;
  background-color: ${({ $variant }) =>
    $variant === 'outline' ? 'transparent' : '#ec4899'};
  color: ${({ $variant }) => ($variant === 'outline' ? '#9d174d' : 'white')};
  border: ${({ $variant }) =>
    $variant === 'outline' ? '1px solid #ec4899' : 'none'};
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
`;

const StyledComponentsComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <Card data-testid="styled-components-component">
      <Heading>Styled Components</Heading>
      <Description>
        CSS-in-JS with tagged templates and automatic critical CSS extraction.
      </Description>
      <ChipRow>
        <Chip $color="#ec4899">Badge</Chip>
        <Chip $color="#8b5cf6">Styled</Chip>
        <Chip $color="#f59e0b">Outline</Chip>
      </ChipRow>
      <Count data-testid="styled-components-count">Count: {count}</Count>
      <ButtonRow>
        <StyledButton
          data-testid="styled-components-button"
          onClick={() => setCount((previous) => previous + 1)}
        >
          Increment
        </StyledButton>
        <StyledButton $variant="outline" onClick={() => setCount(0)}>
          Reset
        </StyledButton>
      </ButtonRow>
    </Card>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-styled-0000-0000-0000-000000000007',
  name: 'styled-components-component',
  description: 'A front component using styled-components',
  component: StyledComponentsComponent,
});
