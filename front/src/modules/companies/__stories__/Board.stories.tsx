import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { CompanyBoard } from '../board/components/CompanyBoard';
import { HooksCompanyBoard } from '../components/HooksCompanyBoard';
import { CompanyBoardRecoilScopeContext } from '../states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';

const meta: Meta<typeof CompanyBoard> = {
  title: 'Modules/Companies/Board',
  component: CompanyBoard,
  decorators: [
    (Story) => (
      <RecoilScope SpecificContext={CompanyBoardRecoilScopeContext}>
        <HooksCompanyBoard />
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </RecoilScope>
    ),
    ComponentDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof CompanyBoard>;

export const OneColumnBoard: Story = {};
