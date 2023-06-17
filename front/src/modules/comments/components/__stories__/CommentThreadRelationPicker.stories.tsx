import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCommentThreads } from '~/testing/mock-data/comment-threads';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { CommentThreadRelationPicker } from '../CommentThreadRelationPicker';

const meta: Meta<typeof CommentThreadRelationPicker> = {
  title: 'Modules/Comments/CommentThreadRelationPicker',
  component: CommentThreadRelationPicker,
  parameters: {
    msw: graphqlMocks,
  },
};

const StyledContainer = styled.div`
  width: 400px;
`;

export default meta;
type Story = StoryObj<typeof CommentThreadRelationPicker>;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <StyledContainer>
      <CommentThreadRelationPicker commentThread={mockedCommentThreads[0]} />
    </StyledContainer>,
  ),
};
