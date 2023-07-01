import { StrictMode } from 'react';
import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { Company } from '../../../../generated/graphql';
import { mockedCompaniesData } from '../../../../testing/mock-data/companies';
import { CompanyBoardCard } from '../CompanyBoardCard';

const meta: Meta<typeof CompanyBoardCard> = {
  title: 'UI/Board/CompanyBoardCard',
  component: CompanyBoardCard,
};

export default meta;
type Story = StoryObj<typeof CompanyBoardCard>;

const selectJestFn = jest.fn();

export const UnselectedCompanyCompanyBoardCard: Story = {
  render: () => (
    <StrictMode>
      <CompanyBoardCard
        company={mockedCompaniesData[0] as Company}
        selected={false}
        onSelect={selectJestFn}
      />
    </StrictMode>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(selectJestFn).toHaveBeenCalledTimes(0);
    const checkbox = canvas.getByRole('input');
    userEvent.click(checkbox);
    expect(selectJestFn).toHaveBeenCalledTimes(1);
  },
};

export const SelectedCompanyCompanyBoardCard: Story = {
  render: () => (
    <StrictMode>
      <CompanyBoardCard
        company={mockedCompaniesData[0] as Company}
        selected={true}
        onSelect={selectJestFn}
      />
    </StrictMode>
  ),
};
