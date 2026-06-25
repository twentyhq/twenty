import { type Decorator } from '@storybook/react-vite';
import { HelmetProvider } from '@dr.pogodin/react-helmet';

export const HelmetProviderDecorator: Decorator = (Story) => {
  return (
    <HelmetProvider>
      <Story />
    </HelmetProvider>
  );
};
