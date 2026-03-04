import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { type Decorator } from '@storybook/react-vite';

export const RightDrawerDecorator: Decorator = (Story) => (
  <SidePanelProvider value={{ isInSidePanel: false }}>
    <Story />
  </SidePanelProvider>
);
