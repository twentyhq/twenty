import { type Preview } from '@storybook/react-vite';
import { THEME_LIGHT, ThemeContextProvider } from 'twenty-ui/theme';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const theme = THEME_LIGHT;

      return (
        <ThemeContextProvider theme={theme}>
          <Story />
        </ThemeContextProvider>
      );
    },
  ],
  args: {
    theme: THEME_LIGHT,
  },
};

export default preview;
