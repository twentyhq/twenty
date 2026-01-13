import { type Decorator } from '@storybook/react-vite';
import { HelmetProvider } from 'react-helmet-async';

export const HelmetProviderDecorator: Decorator = (Story) => {
  return (
    <HelmetProvider>
      <Story />
    </HelmetProvider>
  );
};
