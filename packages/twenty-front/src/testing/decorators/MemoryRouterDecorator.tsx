import { type Decorator } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

export const MemoryRouterDecorator: Decorator = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);
