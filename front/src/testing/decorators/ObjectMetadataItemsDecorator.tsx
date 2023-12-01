import { Decorator } from '@storybook/react';

import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';

export const ObjectMetadataItemsDecorator: Decorator = (Story) => (
  <ObjectMetadataItemsProvider>
    <Story />
  </ObjectMetadataItemsProvider>
);
