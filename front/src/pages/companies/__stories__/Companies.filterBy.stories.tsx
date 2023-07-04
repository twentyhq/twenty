import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import assert from 'assert';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';
import { sleep } from '~/testing/sleep';

import { Companies } from '../Companies';

import { Story } from './Companies.stories';

const meta: Meta<typeof Companies> = {
  title: 'Pages/Companies/FilterBy',
  component: Companies,
};

export default meta;

export const FilterByName: Story = {
  render: getRenderWrapperForPage(<Companies />, '/companies'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = canvas.getByText('Filter');
    await userEvent.click(filterButton);

    const nameFilterButton = canvas
      .queryAllByTestId('dropdown-menu-item')
      .find((item) => {
        return item.textContent === 'Name';
      });

    assert(nameFilterButton);

    await userEvent.click(nameFilterButton);

    const nameInput = canvas.getByPlaceholderText('Name');
    await userEvent.type(nameInput, 'Air', {
      delay: 200,
    });

    await sleep(1000);

    expect(await canvas.findByText('Airbnb')).toBeInTheDocument();
    expect(await canvas.findByText('Aircall')).toBeInTheDocument();
    await expect(canvas.queryAllByText('Qonto')).toStrictEqual([]);

    expect(await canvas.findByText('Name:')).toBeInTheDocument();
    expect(await canvas.findByText('Contains Air')).toBeInTheDocument();
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export const FilterByAccountOwner: Story = {
  render: getRenderWrapperForPage(<Companies />, '/companies'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = canvas.getByText('Filter');
    await userEvent.click(filterButton);

    const accountOwnerFilterButton = (
      await canvas.findAllByTestId('dropdown-menu-item')
    ).find((item) => {
      return item.textContent === 'Account owner';
    });

    assert(accountOwnerFilterButton);

    await userEvent.click(accountOwnerFilterButton);

    const accountOwnerNameInput = canvas.getByPlaceholderText('Account owner');
    await userEvent.type(accountOwnerNameInput, 'Char', {
      delay: 200,
    });

    await sleep(1000);

    const charlesChip = canvas
      .getAllByTestId('dropdown-menu-item')
      .find((item) => {
        console.log({ item });
        return item.textContent?.includes('Charles Test');
      });

    assert(charlesChip);

    await userEvent.click(charlesChip);

    // TODO: fix msw where clauses
    // expect(await canvas.findByText('Airbnb')).toBeInTheDocument();
    // await expect(canvas.queryAllByText('Qonto')).toStrictEqual([]);

    expect(await canvas.findByText('Account owner:')).toBeInTheDocument();
    expect(await canvas.findByText('Is Charles Test')).toBeInTheDocument();
  },
  parameters: {
    msw: graphqlMocks,
  },
};
