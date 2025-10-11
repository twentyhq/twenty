import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { type Decorator } from '@storybook/react';

export const ScrollWrapperDecorator: Decorator = (Story) => (
  <ScrollWrapperComponentInstanceContext.Provider
    value={{ instanceId: 'scroll-wrapper' }}
  >
    <Story />
  </ScrollWrapperComponentInstanceContext.Provider>
);
