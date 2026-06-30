import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { type Decorator } from '@storybook/react-vite';

export const SidePanelDecorator: Decorator = (Story) => (
  <SidePanelProvider value={{ isInSidePanel: false }}>
    <Story />
  </SidePanelProvider>
);
