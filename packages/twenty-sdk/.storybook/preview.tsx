import { type Preview } from '@storybook/react-vite';
import { ColorSchemeProvider } from 'twenty-ui/theme-constants';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      return (
        <ColorSchemeProvider colorScheme="light">
          <Story />
        </ColorSchemeProvider>
      );
    },
  ],
};

export default preview;
