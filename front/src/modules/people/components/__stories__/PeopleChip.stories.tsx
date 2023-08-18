import { BrowserRouter } from 'react-router-dom';
import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { PersonChip } from '../PersonChip';

const StyledTestCellContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  height: fit-content;
  justify-content: space-between;
  max-width: 250px;
  min-width: 250px;
  overflow: hidden;
`;

const meta: Meta<typeof PersonChip> = {
  title: 'Modules/People/PersonChip',
  component: PersonChip,
  decorators: [
    (Story) => (
      <StyledTestCellContainer>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </StyledTestCellContainer>
    ),
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof PersonChip>;

export const SmallName: Story = {
  args: { id: 'tim_fake_id', name: 'Tim C.' },
};

export const BigName: Story = {
  args: { id: 'steve_fake_id', name: 'Steve LoremIpsumLoremIpsumLoremIpsum' },
};
