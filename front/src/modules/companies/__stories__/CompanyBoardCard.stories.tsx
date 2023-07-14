import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { Company } from '~/generated/graphql';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedPipelineProgressData } from '~/testing/mock-data/pipeline-progress';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

const meta: Meta<typeof CompanyBoardCard> = {
  title: 'UI/Board/CompanyBoardCard',
  component: CompanyBoardCard,
};

export default meta;
type Story = StoryObj<typeof CompanyBoardCard>;

const FakeSelectableCompanyBoardCard = () => {
  const [selected, setSelected] = useState<boolean>(false);

  return <CompanyBoardCard />;
};

export const CompanyCompanyBoardCard: Story = {
  render: getRenderWrapperForComponent(<FakeSelectableCompanyBoardCard />),
};
