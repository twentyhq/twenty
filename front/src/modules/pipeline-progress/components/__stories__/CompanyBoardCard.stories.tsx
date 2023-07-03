import { StrictMode, useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Company } from '../../../../generated/graphql';
import { mockedCompaniesData } from '../../../../testing/mock-data/companies';
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
    <CompanyBoardCard
      company={mockedCompaniesData[0] as Company}
      selected={selected}
      onSelect={() => setSelected(!selected)}
    />
  );
};

export const CompanyCompanyBoardCard: Story = {
  render: () => (
    <StrictMode>
      <FakeSelectableCompanyBoardCard />
    </StrictMode>
  ),
};
