import { MemoryRouter } from 'react-router-dom';
import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCommentThreads } from '~/testing/mock-data/comment-threads';

import { CommentThreadRelationPicker } from '../CommentThreadRelationPicker';

const StyledContainer = styled.div`
  width: 400px;
`;

const meta: Meta<typeof CommentThreadRelationPicker> = {
  title: 'Modules/Comments/CommentThreadRelationPicker',
  component: CommentThreadRelationPicker,
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
  args: { commentThread: mockedCommentThreads[0] },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof CommentThreadRelationPicker>;

export const Default: Story = {};
