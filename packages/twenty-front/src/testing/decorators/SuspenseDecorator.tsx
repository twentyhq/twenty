import { type Decorator } from '@storybook/react-vite';
import { Suspense } from 'react';

export const SuspenseDecorator: Decorator = (Story) => (
  <Suspense fallback={null}>
    <Story />
  </Suspense>
);
