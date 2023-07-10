import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import CompanyChip from '../CompanyChip';

const meta: Meta<typeof CompanyChip> = {
  title: 'Modules/Companies/CompanyChip',
  component: CompanyChip,
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
  text-wrap: nowrap;
`;

export const SmallName: Story = {
  render: getRenderWrapperForComponent(
    <TestCellContainer>
      <CompanyChip
        id="airbnb"
        name="Airbnb"
        picture="https://api.faviconkit.com/airbnb.com/144"
      />
    </TestCellContainer>,
  ),
};

export const BigName: Story = {
  render: getRenderWrapperForComponent(
    <TestCellContainer>
      <CompanyChip
        id="google"
        name="Google with a real big name to overflow the cell"
        picture="https://api.faviconkit.com/google.com/144"
      />
    </TestCellContainer>,
  ),
};
