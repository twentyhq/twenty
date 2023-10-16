import { Meta, StoryObj } from '@storybook/react';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { Companies } from '../Companies';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Companies',
  component: Companies,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CompaniesPage },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof Companies>;

export const Default: Story = {};
