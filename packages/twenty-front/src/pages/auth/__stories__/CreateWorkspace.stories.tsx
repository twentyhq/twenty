import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { CreateWorkspace } from '../CreateWorkspace';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/CreateWorkspace',
  component: CreateWorkspace,
  decorators: [
    (Story) => {
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      setCurrentWorkspace(null);
      return <Story />;
    },
    PageDecorator,
  ],
  args: { routePath: AppPath.CreateWorkspace },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof CreateWorkspace>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Create your workspace');
  },
};
