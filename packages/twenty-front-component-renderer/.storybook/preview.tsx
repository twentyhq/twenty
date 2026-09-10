import { type Preview } from '@storybook/react-vite';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import 'twenty-ui/theme-light.css';
import 'twenty-ui/theme-dark.css';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      return (
        <ThemeProvider colorScheme="light">
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
