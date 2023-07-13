import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { Companies } from '../Companies';

import { Story } from './Companies.stories';

const meta: Meta<typeof Companies> = {
  title: 'Pages/Companies/SortBy',
  component: Companies,
};

export default meta;

export const SortByName: Story = {
  render: getRenderWrapperForPage(<Companies />, '/companies'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sortButton = await canvas.findByText('Sort');
    await userEvent.click(sortButton);

    const nameSortButton = canvas.getByText('Name', { selector: 'li' });
    await userEvent.click(nameSortButton);

    expect(await canvas.getByTestId('remove-icon-name')).toBeInTheDocument();

    expect(await canvas.findByText('Airbnb')).toBeInTheDocument();

    const cancelButton = canvas.getByText('Cancel');
    await userEvent.click(cancelButton);

    await expect(canvas.queryAllByTestId('remove-icon-name')).toStrictEqual([]);
  },
  parameters: {
    msw: graphqlMocks,
  },
};
