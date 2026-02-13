import { css } from '@emotion/react';
import { useState } from 'react';
import { defineFrontComponent } from '@/sdk';

const containerStyle = css`
  padding: 20px;
  background-color: #fefce8;
  border: 2px solid #facc15;
  border-radius: 12px;
  font-family: system-ui, sans-serif;
`;

const headingStyle = css`
  color: #854d0e;
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 12px;
`;

const countStyle = css`
  font-size: 32px;
  font-weight: 800;
  color: #ca8a04;
  margin-bottom: 16px;
`;

const buttonStyle = css`
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
    <div data-testid="emotion-component" css={containerStyle}>
      <h2 css={headingStyle}>Emotion CSS Component</h2>
      <p css={countStyle} data-testid="emotion-count">
        Count: {count}
      </p>
      <button
        data-testid="emotion-button"
        css={buttonStyle}
        onClick={() => setCount((previous) => previous + 1)}
      >
        Increment
      </button>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-emotion-0000-0000-0000-000000000006',
  name: 'emotion-component',
  description: 'A front component using Emotion css prop',
  component: EmotionComponent,
});
