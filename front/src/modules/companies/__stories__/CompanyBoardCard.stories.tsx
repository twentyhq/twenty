import { Meta, StoryObj } from '@storybook/react';

import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { BoardCardContext } from '@/pipeline-progress/states/BoardCardContext';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

const meta: Meta<typeof CompanyBoardCard> = {
  title: 'UI/Board/CompanyBoardCard',
  component: CompanyBoardCard,
};

export default meta;
type Story = StoryObj<typeof CompanyBoardCard>;

const FakeSelectableCompanyBoardCard = () => {
  return (
    <RecoilScope SpecificContext={BoardCardContext}>
      <CompanyBoardCard />;
    </RecoilScope>
  );
};

export const CompanyCompanyBoardCard: Story = {
  render: getRenderWrapperForComponent(<FakeSelectableCompanyBoardCard />),
};
