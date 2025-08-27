import { HelmetProvider } from 'react-helmet-async';
import { type Decorator } from '@storybook/react';

export const HelmetProviderDecorator: Decorator = (Story) => {
  return (
    <HelmetProvider>
      <Story />
    </HelmetProvider>
  );
};
