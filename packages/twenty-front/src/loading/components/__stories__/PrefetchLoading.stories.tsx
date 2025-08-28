import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { RecordIndexPage } from '~/pages/object-record/RecordIndexPage';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { PrefetchLoadingDecorator } from '~/testing/decorators/PrefetchLoadingDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'App/Loading/PrefetchLoading',
  component: RecordIndexPage,
  args: {
    routePath: '/objects/:objectNamePlural',
    routeParams: {
      ':objectNamePlural': 'companies',
    },
  },
  parameters: {
    msw: graphqlMocks,
    prefetchLoadingSetDelay: 1000,
  },
  tags: ['no-tests'],
};

export default meta;

export type Story = StoryObj<typeof RecordIndexPage>;

export const Default: Story = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  decorators: [PrefetchLoadingDecorator, PageDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Search');
    await canvas.findByText('Settings');
    await canvas.findByText('Linkedin');
    await canvas.findByText('Companies');
  },
};
