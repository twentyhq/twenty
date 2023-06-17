import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { People } from '../People';

import { Story } from './People.stories';

const meta: Meta<typeof People> = {
  title: 'Pages/People/Comments',
  component: People,
};

export default meta;

export const OpenCommentsSection: Story = {
  render: getRenderWrapperForPage(<People />),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const firstRow = await canvas.findByTestId('row-id-1');

    expect(firstRow).toBeDefined();

    const commentsChip = await within(firstRow).findByTestId('comment-chip');
    expect(commentsChip).toBeDefined();

    userEvent.click(commentsChip);
    const commentSection = await canvas.findByText('Comments');
    expect(commentSection).toBeDefined();
  },
  parameters: {
    msw: graphqlMocks,
  },
};
