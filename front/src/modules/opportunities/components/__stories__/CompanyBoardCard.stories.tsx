import { StrictMode } from 'react';
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

export const CompanyCompanyBoardCard: Story = {
  render: () => (
    <StrictMode>
      <CompanyBoardCard company={mockedCompaniesData[0] as Company} />
    </StrictMode>
  ),
};
