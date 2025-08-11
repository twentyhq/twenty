import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { type Decorator } from '@storybook/react';

export const SnackBarDecorator: Decorator = (Story) => (
  <SnackBarComponentInstanceContext.Provider
    value={{ instanceId: 'snack-bar-manager' }}
  >
    <Story />
  </SnackBarComponentInstanceContext.Provider>
);
