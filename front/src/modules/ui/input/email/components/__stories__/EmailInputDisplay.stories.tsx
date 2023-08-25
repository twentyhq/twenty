import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { EmailInputDisplay } from '../EmailInputDisplay';

const meta: Meta = {
  title: 'Modules/People/EmailInputDisplay',
  component: EmailInputDisplay,
  decorators: [
    (Story) => (
      <StyledTestEmailContainer>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </StyledTestEmailContainer>
    ),
    ComponentDecorator,
  ],
  args: {
    value: 'mustajab.ikram@google.com',
  },
};

export default meta;

type Story = StoryObj<typeof EmailInputDisplay>;

const StyledTestEmailContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
`;
export const Default: Story = {};
