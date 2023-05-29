import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import Companies from '../Companies';
import { Story } from './Companies.stories';
import { mocks, render } from './shared';

const meta: Meta<typeof Companies> = {
  title: 'Pages/Companies',
  component: Companies,
};

export default meta;

export const FilterByName: Story = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = canvas.getByText('Filter');
    await userEvent.click(filterButton);

    const nameFilterButton = canvas.getByText('Name', { selector: 'li' });
    await userEvent.click(nameFilterButton);

    const nameInput = canvas.getByPlaceholderText('Name');
    await userEvent.type(nameInput, 'Air', {
      delay: 200,
    });

    expect(await canvas.findByText('Airbnb')).toBeInTheDocument();
    expect(await canvas.findByText('Aircall')).toBeInTheDocument();
    await expect(canvas.queryAllByText('Qonto')).toStrictEqual([]);

    expect(await canvas.findByText('Name:')).toBeInTheDocument();
    expect(await canvas.findByText('Contains Air')).toBeInTheDocument();
  },
  parameters: {
    msw: mocks,
  },
};

export const FilterByAccountOwner: Story = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = canvas.getByText('Filter');
    await userEvent.click(filterButton);

    const accountOwnerFilterButton = canvas.getByText('Account Owner', {
      selector: 'li',
    });
    await userEvent.click(accountOwnerFilterButton);

    const accountOwnerNameInput = canvas.getByPlaceholderText('Account Owner');
    await userEvent.type(accountOwnerNameInput, 'Char', {
      delay: 200,
    });

    const charlesChip = canvas.getByText('Charles Test', { selector: 'li' });
    await userEvent.click(charlesChip);

    expect(await canvas.findByText('Airbnb')).toBeInTheDocument();
    await expect(canvas.queryAllByText('Qonto')).toStrictEqual([]);

    expect(await canvas.findByText('Account Owner:')).toBeInTheDocument();
    expect(await canvas.findByText('Is Charles Test')).toBeInTheDocument();
  },
  parameters: {
    msw: mocks,
  },
};
