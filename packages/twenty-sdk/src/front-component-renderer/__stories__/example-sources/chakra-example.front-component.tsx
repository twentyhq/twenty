import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { useState } from 'react';

import { defineFrontComponent } from '@/sdk';

const ChakraExampleContent = () => {
  const [count, setCount] = useState(0);

  return (
    <div
      data-testid="chakra-example"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#319795',
          margin: 0,
        }}
      >
        Chakra UI Example
      </h2>

      <p
        data-testid="chakra-description"
        style={{ color: '#4a5568', fontSize: 14, lineHeight: 1.6, margin: 0 }}
      >
        This component uses Chakra UI through the remote rendering pipeline.
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span
          data-testid="chakra-badge"
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            backgroundColor: '#319795',
            color: 'white',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Chakra UI
        </span>
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            backgroundColor: '#805ad5',
            color: 'white',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Remote DOM
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          padding: 16,
          backgroundColor: '#f7fafc',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <p
          data-testid="chakra-count"
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#2d3748',
            margin: 0,
          }}
        >
          Count: {count}
        </p>
        <button
          data-testid="chakra-increment"
          onClick={() => setCount((previous) => previous + 1)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#319795',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Increment
        </button>
        <button
          data-testid="chakra-reset"
          onClick={() => setCount(0)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#e2e8f0',
            color: '#4a5568',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

const ChakraExampleComponent = () => (
  <ChakraProvider value={defaultSystem}>
    <ChakraExampleContent />
  </ChakraProvider>
);

export default defineFrontComponent({
  universalIdentifier:
    'test-chakra-00000000-0000-0000-0000-000000000004',
  name: 'chakra-example-component',
  description:
    'Example component using Chakra UI through remote rendering',
  component: ChakraExampleComponent,
});
