import { type Preview } from '@storybook/react-vite';
import '@new-ui/theme-constants/theme-light.css';
import '@new-ui/theme-constants/theme-dark.css';
import { ThemeProvider } from '@new-ui/theme-constants';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    a11y: {
      test: 'error',
    },
  },
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
