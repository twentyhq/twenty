import { StrictMode } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Company, Person } from '../../../../generated/graphql';
import { mockedCompaniesData } from '../../../../testing/mock-data/companies';
import { mockedPeopleData } from '../../../../testing/mock-data/people';
import { BoardItem } from '../../../ui/components/board/BoardItem';
import { BoardCard } from '../BoardCard';

const meta: Meta<typeof BoardCard> = {
  title: 'UI/Board/BoardCard',
  component: BoardCard,
};

export default meta;
type Story = StoryObj<typeof BoardCard>;

export const CompanyBoardCard: Story = {
  render: () => (
    <StrictMode>
      <BoardItem draggableProvided={undefined}>
        <BoardCard item={mockedCompaniesData[0] as Company} />
      </BoardItem>
    </StrictMode>
  ),
};

export const PersonBoardCard: Story = {
  render: () => (
    <StrictMode>
      <BoardItem draggableProvided={undefined}>
        <BoardCard item={mockedPeopleData[0] as Person} />
      </BoardItem>
    </StrictMode>
  ),
};
