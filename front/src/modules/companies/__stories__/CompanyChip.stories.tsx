import { BrowserRouter } from 'react-router-dom';
import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { CompanyChip } from '../components/CompanyChip';

const meta: Meta<typeof CompanyChip> = {
  title: 'Modules/Companies/CompanyChip',
  component: CompanyChip,
  decorators: [
    (Story) => (
      <TestCellContainer>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </TestCellContainer>
    ),
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof CompanyChip>;

const TestCellContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  display: flex;

  height: fit-content;
  justify-content: space-between;

  max-width: 250px;

  min-width: 250px;

  overflow: hidden;
`;

export const SmallName: Story = {
  args: {
    id: 'airbnb',
    name: 'Airbnb',
    pictureUrl: 'https://api.faviconkit.com/airbnb.com/144',
  },
};

export const Clickable: Story = {
  args: { ...SmallName.args, clickable: true },
};

export const BigName: Story = {
  args: {
    id: 'google',
    name: 'Google with a real big name to overflow the cell',
    pictureUrl: 'https://api.faviconkit.com/google.com/144',
  },
};
