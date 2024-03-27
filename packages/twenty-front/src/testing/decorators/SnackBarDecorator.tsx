import { Decorator } from '@storybook/react';
import { SnackBarProviderScope } from 'twenty-ui';

export const SnackBarDecorator: Decorator = (Story) => (
  <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
    <Story />
  </SnackBarProviderScope>
);
