import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { PhoneInputDisplay } from '../PhoneInputDisplay'; // Adjust the import path as needed

const meta: Meta = {
  title: 'Modules/People/PhoneInputDisplay',
  component: PhoneInputDisplay,
  decorators: [
    (Story) => (
      <StyledTestPhoneContainer>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </StyledTestPhoneContainer>
    ),
    ComponentDecorator,
  ],
  args: {
    value: '+33788901234',
  },
};

export default meta;

type Story = StoryObj<typeof PhoneInputDisplay>;

const StyledTestPhoneContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
`;

export const Default: Story = {};
