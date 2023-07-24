import type { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { People } from '../People';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/People',
  component: People,
  decorators: [PageDecorator],
  args: { currentPath: '/people' },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof People>;

export const Default: Story = {};
