import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { PrefetchLoadedDecorator } from '~/testing/decorators/PrefetchLoadedDecorator';

const meta: Meta<typeof NavigationDrawerSectionForObjectMetadataItems> = {
  title: 'Modules/ObjectMetadata/NavigationDrawerSectionForObjectMetadataItems',
  component: NavigationDrawerSectionForObjectMetadataItems,
  decorators: [
    IconsProviderDecorator,
    ObjectMetadataItemsDecorator,
    ComponentWithRouterDecorator,
    ComponentWithRecoilScopeDecorator,
    SnackBarDecorator,
    PrefetchLoadedDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof NavigationDrawerSectionForObjectMetadataItems>;

export const Default: Story = {
  play: async () => {
    const canvas = within(document.body);
    expect(await canvas.findByText('People')).toBeInTheDocument();
    expect(await canvas.findByText('Companies')).toBeInTheDocument();
    expect(await canvas.findByText('Opportunities')).toBeInTheDocument();
  },
};
