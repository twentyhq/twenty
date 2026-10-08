import { type Decorator } from '@storybook/react-vite';

const WIDGET_STYLE = { width: 320, height: 180 };

export const TwoWidgetsDecorator: Decorator = (Story) => (
  <div style={{ display: 'flex', gap: 48, minHeight: 480 }}>
    <div role="group" aria-label="First widget" style={WIDGET_STYLE}>
      <Story />
    </div>
    <div role="group" aria-label="Second widget" style={WIDGET_STYLE}>
      <Story />
    </div>
  </div>
);
