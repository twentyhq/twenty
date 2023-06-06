import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { graphqlMocks } from '~/testing/graphqlMocks';

import { Companies } from '../Companies';

import { Story } from './Companies.stories';
import { render } from './shared';

const meta: Meta<typeof Companies> = {
  title: 'Pages/Companies',
  component: Companies,
};

export default meta;

export const OpenCommentsSection: Story = {
  render,
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
