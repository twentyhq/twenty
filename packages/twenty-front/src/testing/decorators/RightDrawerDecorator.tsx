import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { type Decorator } from '@storybook/react-vite';

export const RightDrawerDecorator: Decorator = (Story) => (
  <RightDrawerProvider value={{ isInRightDrawer: false }}>
    <Story />
  </RightDrawerProvider>
);
