import { type Decorator } from '@storybook/react-vite';
import { ToastProvider } from 'twenty-ui/components';

export const ToastDecorator: Decorator = (Story) => (
  <ToastProvider>
    <Story />
  </ToastProvider>
);
