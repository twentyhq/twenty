import { MemoryRouter } from 'react-router-dom';
import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedActivities } from '~/testing/mock-data/activities';

import { ActivityRelationPicker } from '../ActivityRelationPicker';

const StyledContainer = styled.div`
  width: 400px;
`;

const meta: Meta<typeof ActivityRelationPicker> = {
  title: 'Modules/Comments/ActivityRelationPicker',
  component: ActivityRelationPicker,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <StyledContainer>
          <Story />
        </StyledContainer>
      </MemoryRouter>
    ),
    ComponentDecorator,
  ],
  args: { activity: mockedActivities[0] },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof ActivityRelationPicker>;

export const Default: Story = {};
