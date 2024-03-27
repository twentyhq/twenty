import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { ObjectMetadataNavItems } from '../ObjectMetadataNavItems';

const meta: Meta<typeof ObjectMetadataNavItems> = {
  title: 'Modules/ObjectMetadata/ObjectMetadataNavItems',
  component: ObjectMetadataNavItems,
  decorators: [
    ObjectMetadataItemsDecorator,
    ComponentWithRouterDecorator,
    ComponentWithRecoilScopeDecorator,
    SnackBarDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof ObjectMetadataNavItems>;

export const Default: Story = {
  play: async () => {
    const canvas = within(document.body);
    expect(await canvas.findByText('People')).toBeInTheDocument();
    expect(await canvas.findByText('Companies')).toBeInTheDocument();
    expect(await canvas.findByText('Opportunities')).toBeInTheDocument();
  },
};
