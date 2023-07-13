import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Company } from '~/generated/graphql';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedPipelineProgressData } from '~/testing/mock-data/pipeline-progress';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { CompanyBoardCard } from '../CompanyBoardCard';

const meta: Meta<typeof CompanyBoardCard> = {
  title: 'UI/Board/CompanyBoardCard',
  component: CompanyBoardCard,
};

export default meta;
type Story = StoryObj<typeof CompanyBoardCard>;

const FakeSelectableCompanyBoardCard = () => {
  const [selected, setSelected] = useState<boolean>(false);

  return (
    <p>Hello</p>
    // <CompanyBoardCard
    //   entity={mockedCompaniesData[0] as Company}
    //   pipelineProgress={mockedPipelineProgressData[0]}
    //   selected={selected}
    //   onSelect={() => setSelected(!selected)}
    //   onCardUpdate={async (_) => {}} // eslint-disable-line @typescript-eslint/no-empty-function
    // />
  );
};

export const CompanyCompanyBoardCard: Story = {
  render: getRenderWrapperForComponent(<FakeSelectableCompanyBoardCard />),
};
