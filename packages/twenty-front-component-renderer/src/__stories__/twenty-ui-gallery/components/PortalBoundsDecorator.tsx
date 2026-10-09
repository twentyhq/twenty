import { type Decorator } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

export const PortalBoundsDecorator: Decorator = (Story) => {
  const [hostActionCount, setHostActionCount] = useState(0);

  return (
    <div style={{ minHeight: 700 }}>
      <Button
        style={{ position: 'absolute', left: 8, top: 8 }}
        onClick={() => setHostActionCount(hostActionCount + 1)}
      >
        Host action
      </Button>
      <Text role="status" aria-label="Host actions">
        Host actions: {hostActionCount}
      </Text>
      <div
        style={{
          width: 320,
          height: 180,
          margin: '240px 320px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          role="region"
          aria-label="Widget scroll frame"
          style={{ width: '100%', height: '100%', overflow: 'auto' }}
        >
          <div role="group" aria-label="Widget" style={{ height: 260 }}>
            <Story />
          </div>
        </div>
      </div>
    </div>
  );
};
