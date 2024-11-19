import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { RemoteNavigationDrawerSection } from '../RemoteNavigationDrawerSection';

import { within } from '@storybook/test';
import { PrefetchLoadedDecorator } from '~/testing/decorators/PrefetchLoadedDecorator';

const meta: Meta<typeof RemoteNavigationDrawerSection> = {
  title: 'Modules/ObjectMetadata/RemoteNavigationDrawerSection',
  component: RemoteNavigationDrawerSection,
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
type Story = StoryObj<typeof RemoteNavigationDrawerSection>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('People', undefined, { timeout: 10000 });
    await canvas.findByText('Companies');
    await canvas.findByText('Opportunities');
  },
};
