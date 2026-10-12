import { type Decorator } from '@storybook/react-vite';

export const ScrollBoundaryDecorator: Decorator = (Story) => (
  <div
    role="region"
    aria-label="Widget scroll frame"
    style={{ width: 360, height: 150, overflow: 'auto' }}
  >
    <Story />
  </div>
);
