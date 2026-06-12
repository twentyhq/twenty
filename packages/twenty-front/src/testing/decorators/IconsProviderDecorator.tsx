import { type Decorator } from '@storybook/react-vite';
import { IconsProvider } from 'twenty-ui-deprecated/display';

export const IconsProviderDecorator: Decorator = (Story) => {
  return (
    <IconsProvider>
      <Story />
    </IconsProvider>
  );
};
