import { MemoryRouter } from 'react-router-dom';
import { Decorator } from '@storybook/react';

import { ComponentStorybookLayout } from '../ComponentStorybookLayout';

export const ComponentWithRouterDecorator: Decorator = (Story) => (
  <ComponentStorybookLayout>
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  </ComponentStorybookLayout>
);
