import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { Companies } from '../Companies';

import { Story } from './Companies.stories';
import { mocks, render } from './shared';

const meta: Meta<typeof Companies> = {
  title: 'Pages/Companies/SortBy',
  component: Companies,
};

export default meta;

export const SortByName: Story = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sortButton = canvas.getByText('Sort');
    await userEvent.click(sortButton);

    const nameSortButton = canvas.getByText('Name', { selector: 'li' });
    await userEvent.click(nameSortButton);

    expect(await canvas.getByTestId('remove-icon-name')).toBeInTheDocument();

    expect(await canvas.findByText('Airbnb')).toBeInTheDocument();

    expect(
      (await canvas.findAllByRole('checkbox')).map((item) => {
        return item.getAttribute('id');
      })[1],
    ).toStrictEqual('checkbox-selected-89bb825c-171e-4bcc-9cf7-43448d6fb278');

    const cancelButton = canvas.getByText('Cancel');
    await userEvent.click(cancelButton);

    await expect(canvas.queryAllByTestId('remove-icon-name')).toStrictEqual([]);
  },
  parameters: {
    msw: mocks,
  },
};
