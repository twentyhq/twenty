import { ToastProvider } from 'twenty-ui/feedback';
import { type Decorator } from '@storybook/react-vite';

export const SnackBarDecorator: Decorator = (Story) => (
  <ToastProvider>
    <Story />
  </ToastProvider>
);
