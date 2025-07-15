import { Decorator } from '@storybook/react';

import { SnackBarComponentInstanceContextProvider } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarComponentInstanceContextProvider';

export const SnackBarDecorator: Decorator = (Story) => (
  <SnackBarComponentInstanceContextProvider snackBarComponentInstanceId="snack-bar-manager">
    <Story />
  </SnackBarComponentInstanceContextProvider>
);
