import { Decorator } from '@storybook/react';

import { IconsProvider } from '@/ui/display/icon/components/IconsProvider';

export const IconsProviderDecorator: Decorator = (Story) => {
  return (
    <IconsProvider>
      <Story />
    </IconsProvider>
  );
};
