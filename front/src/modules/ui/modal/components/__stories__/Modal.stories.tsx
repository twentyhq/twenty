import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { Modal } from '../Modal';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal/Modal',
  component: Modal,
  decorators: [ComponentDecorator],
};
export default meta;

type Story = StoryObj<typeof Modal>;

const StyledContentContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  margin: 5px;
  padding: ${({ theme })=>theme.spacing(10) } 
`;

const args = {
  isOpen: true,
  children: <StyledContentContainer>Lorem ipsum</StyledContentContainer>,
};

export const Default: Story = {
  args,
  decorators: [ComponentDecorator],
};

Default.argTypes = {
  children: { control: false },
};
