import { type Decorator } from '@storybook/react-vite';
import { IconsProvider } from 'twenty-ui/display';

export const IconsProviderDecorator: Decorator = (Story) => {
  return (
    <IconsProvider>
      <Story />
    </IconsProvider>
  );
};
