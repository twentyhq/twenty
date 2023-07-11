import { BrowserRouter } from 'react-router-dom';
import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { PersonChip } from '../PersonChip';

const meta: Meta<typeof PersonChip> = {
  title: 'Modules/Companies/PersonChip',
  component: PersonChip,
};

export default meta;
type Story = StoryObj<typeof PersonChip>;

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
      <BrowserRouter>
        <PersonChip id="tim_fake_id" name="Tim C." />
      </BrowserRouter>
    </TestCellContainer>,
  ),
};

export const BigName: Story = {
  render: getRenderWrapperForComponent(
    <TestCellContainer>
      <BrowserRouter>
        <PersonChip id="steve_fake_id" name="Steve J." />
      </BrowserRouter>
    </TestCellContainer>,
  ),
};
