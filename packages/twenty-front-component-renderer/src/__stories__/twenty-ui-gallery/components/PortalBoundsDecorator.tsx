import { type Decorator } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

const WIDGET_SHIFT_HEIGHT = 40;

export const PortalBoundsDecorator: Decorator = (Story) => {
  const [hostActionCount, setHostActionCount] = useState(0);
  const [isWidgetShifted, setIsWidgetShifted] = useState(false);

  return (
    <div style={{ minHeight: 700 }}>
      <Button
        style={{ position: 'absolute', left: 8, top: 8 }}
        onClick={() => setHostActionCount(hostActionCount + 1)}
      >
        Host action
      </Button>
      <Button
        style={{ position: 'absolute', left: 140, top: 8 }}
        onClick={() => setIsWidgetShifted(!isWidgetShifted)}
      >
        Shift widget
      </Button>
      <Text role="status" aria-label="Host actions">
        Host actions: {hostActionCount}
      </Text>
      <div style={{ height: isWidgetShifted ? WIDGET_SHIFT_HEIGHT : 0 }} />
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
          <div style={{ height: 260 }}>
            <Story />
          </div>
        </div>
      </div>
    </div>
  );
};
