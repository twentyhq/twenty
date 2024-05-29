import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { PrefetchLoadingDecorator } from '~/testing/decorators/PrefetchLoadingDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { RecordIndexPage } from '../RecordIndexPage';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/ObjectRecord/RecordIndexPage',
  component: RecordIndexPage,
  decorators: [PageDecorator],
  args: {
    routePath: '/objects/:objectNamePlural',
    routeParams: {
      ':objectNamePlural': 'companies',
    },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof RecordIndexPage>;

export const Default: Story = {
  decorators: [PrefetchLoadingDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('People');
    await canvas.findAllByText('Companies');
    await canvas.findByText('Opportunities');
    await canvas.findByText('Listings');
    await canvas.findByText('My Customs');
  },
};

export const Loading: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText('People')).toBeNull();
    expect(canvas.queryByText('Opportunities')).toBeNull();
    expect(canvas.queryByText('Listings')).toBeNull();
    expect(canvas.queryByText('My Customs')).toBeNull();
  },
};
