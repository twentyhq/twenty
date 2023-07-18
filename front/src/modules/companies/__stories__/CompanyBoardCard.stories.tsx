import { Meta, StoryObj } from '@storybook/react';

import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { BoardCardDecorator } from '~/testing/decorators';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

const meta: Meta<typeof CompanyBoardCard> = {
  title: 'UI/Board/CompanyBoardCard',
  component: CompanyBoardCard,
  decorators: [BoardCardDecorator],
};

export default meta;
type Story = StoryObj<typeof CompanyBoardCard>;

const FakeSelectableCompanyBoardCard = () => {
  return <CompanyBoardCard />;
};

export const CompanyCompanyBoardCard: Story = {
  render: getRenderWrapperForComponent(<FakeSelectableCompanyBoardCard />),
  parameters: {
    msw: graphqlMocks,
  },
};
