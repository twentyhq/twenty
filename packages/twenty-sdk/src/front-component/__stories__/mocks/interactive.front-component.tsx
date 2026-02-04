import { defineFrontComponent } from '@/sdk';
import { useState } from 'react';

const InteractiveComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <div
      data-testid="interactive-component"
      style={{
        padding: 24,
        backgroundColor: '#faf5ff',
        border: '2px solid #9f7aea',
        borderRadius: 12,
      }}
    >
      <h2
        style={{
          color: '#553c9a',
          fontWeight: 700,
          fontSize: 18,
          marginBottom: 16,
        }}
      >
        Interactive Component
      </h2>
      <p
        data-testid="count-display"
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#6b46c1',
          marginBottom: 16,
        }}
      >
        Count: {count}
      </p>
      <button
        data-testid="increment-button"
        onClick={() => setCount((c) => c + 1)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#805ad5',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Increment
      </button>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-int0-00000000-0000-0000-0000-000000000002',
  name: 'interactive-component',
  description: 'Component with click interactions',
  component: InteractiveComponent,
});
