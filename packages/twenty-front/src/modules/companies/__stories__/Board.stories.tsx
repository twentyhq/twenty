import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { CompanyBoard } from '../board/components/CompanyBoard';

const DoNotRenderEffect = () => <></>;

const meta: Meta<typeof CompanyBoard> = {
  title: 'Modules/Companies/Board',
  component: DoNotRenderEffect,
  decorators: [ComponentWithRouterDecorator, SnackBarDecorator],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof CompanyBoard>;

// FIXME: CompanyBoard is re-rendering so much and exceeding the maximum update depth for some reason.
export const OneColumnBoard: Story = {};
