import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { CompanyBoard } from '../board/components/CompanyBoard';
import { CompanyBoardRecoilScopeContext } from '../states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';

const meta: Meta<typeof CompanyBoard> = {
  title: 'Modules/Companies/Board',
  component: CompanyBoard,
  decorators: [
    (Story) => (
      <CompanyBoardRecoilScopeContext.Provider value="opportunities">
        <Story />
      </CompanyBoardRecoilScopeContext.Provider>
    ),
    ComponentWithRouterDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof CompanyBoard>;

export const OneColumnBoard: Story = {};
