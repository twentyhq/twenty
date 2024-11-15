import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findAllByText('Companies', undefined, { timeout: 3000 });
    await canvas.findByText('Linkedin');
  },
};
