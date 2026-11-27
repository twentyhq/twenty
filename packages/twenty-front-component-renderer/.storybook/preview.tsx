import { FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP } from '../src/host/thread/constants/FrontComponentHostCommunicationApiNoop';
import { type Preview } from '@storybook/react-vite';
import { ThemeProvider } from 'twenty-ui/theme';

import 'twenty-ui/theme-light.css';
import 'twenty-ui/theme-dark.css';

const preview: Preview = {
  tags: ['autodocs'],
  args: {
    frontComponentHostCommunicationApi:
      FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP,
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
