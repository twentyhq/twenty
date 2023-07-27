import { Decorator } from '@storybook/react';

import { ComponentStorybookLayout } from '../ComponentStorybookLayout';

export const ComponentDecorator: Decorator = (Story) => (
  <ComponentStorybookLayout>
    <Story />
  </ComponentStorybookLayout>
);
