import { type Decorator } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';

export const OverflowingListInstancesDecorator: Decorator = (Story) => {
  const [isFirstRendererMounted, setIsFirstRendererMounted] = useState(true);

  return (
    <div>
      <Button onClick={() => setIsFirstRendererMounted(false)}>
        Remove first renderer
      </Button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
        <div role="group" aria-label="First renderer">
          {isFirstRendererMounted && <Story />}
        </div>
        <div role="group" aria-label="Second renderer">
          <Story />
        </div>
      </div>
    </div>
  );
};
