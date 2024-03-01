import { MemoryRouter } from 'react-router-dom';
import { Decorator } from '@storybook/react';

export const MemoryRouterDecorator: Decorator = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);
