import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { CompanyBoard } from '../board/components/CompanyBoard';

const meta: Meta<typeof CompanyBoard> = {
  title: 'Modules/Companies/Board',
  component: CompanyBoard,
  decorators: [
    (Story) => <Story />,
    ComponentWithRouterDecorator,
    SnackBarDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof CompanyBoard>;

export const OneColumnBoard: Story = {};
