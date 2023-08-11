import type { Meta, StoryObj } from '@storybook/react';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { Companies } from '../Companies';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Companies',
  component: Companies,
  decorators: [PageDecorator],
  args: { currentPath: AppPath.CompaniesPage },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof Companies>;

export const Default: Story = {};
