import { Meta, StoryObj } from '@storybook/react';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

import { ImpersonateEffect } from '../ImpersonateEffect';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Impersonate/Impersonate',
  component: ImpersonateEffect,
  decorators: [PageDecorator],
  args: {
    routePath: AppPath.Impersonate,
    routeParams: { ':userId': '1' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof ImpersonateEffect>;

export const Default: Story = {
  play: async () => {
    await sleep(100);
  },
};
