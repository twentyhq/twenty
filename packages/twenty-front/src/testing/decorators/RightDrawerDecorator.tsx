import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { Decorator } from '@storybook/react';

export const RightDrawerDecorator: Decorator = (Story) => (
  <RightDrawerProvider value={{ isInRightDrawer: false }}>
    <Story />
  </RightDrawerProvider>
);
