import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { graphqlMocks } from '~/testing/graphqlMocks';

import { People } from '../People';

import { Story } from './People.stories';
import { render } from './shared';

const meta: Meta<typeof People> = {
  title: 'Pages/People/Comments',
  component: People,
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

    // expect to see comment section
  },
  parameters: {
    msw: graphqlMocks,
  },
};
