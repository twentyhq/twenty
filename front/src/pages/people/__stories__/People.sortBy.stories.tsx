import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';
import { sleep } from '~/testing/sleep';

import { People } from '../People';

import { Story } from './People.stories';

const meta: Meta<typeof People> = {
  title: 'Pages/People/SortBy',
  component: People,
};

export default meta;

export const Email: Story = {
  render: getRenderWrapperForPage(<People />, '/people'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sortButton = await canvas.findByText('Sort');
    await userEvent.click(sortButton);

    const emailSortButton = canvas.getByText('Email', { selector: 'li' });
    await userEvent.click(emailSortButton);

    expect(await canvas.getByTestId('remove-icon-email')).toBeInTheDocument();

    expect(await canvas.findByText('Alexandre Prot')).toBeInTheDocument();
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export const Cancel: Story = {
  render: getRenderWrapperForPage(<People />, '/people'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sortButton = await canvas.findByText('Sort');
    await userEvent.click(sortButton);

    const emailSortButton = canvas.getByText('Email', { selector: 'li' });
    await userEvent.click(emailSortButton);

    expect(await canvas.getByTestId('remove-icon-email')).toBeInTheDocument();

    const cancelButton = canvas.getByText('Cancel');
    await userEvent.click(cancelButton);

    await sleep(1000);

    await expect(canvas.queryAllByTestId('remove-icon-email')).toStrictEqual(
      [],
    );
  },
  parameters: {
    msw: graphqlMocks,
  },
};
