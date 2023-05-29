import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import People from '../People';
import { Story } from './People.stories';
import { mocks, render } from './shared';

const meta: Meta<typeof People> = {
  title: 'Pages/People',
  component: People,
};

export default meta;

export const FilterByEmail: Story = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = canvas.getByText('Filter');
    await userEvent.click(filterButton);

    const emailFilterButton = canvas.getByText('Email', { selector: 'li' });
    await userEvent.click(emailFilterButton);

    const emailInput = canvas.getByPlaceholderText('Email');
    await userEvent.type(emailInput, 'al', {
      delay: 200,
    });

    expect(await canvas.findByText('Alexandre Prot')).toBeInTheDocument();
    await expect(canvas.queryAllByText('John Doe')).toStrictEqual([]);

    expect(await canvas.findByText('Email:')).toBeInTheDocument();
    expect(await canvas.findByText('Contains al')).toBeInTheDocument();
  },
  parameters: {
    msw: mocks,
  },
};

export const FilterByCompanyName: Story = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = canvas.getByText('Filter');
    await userEvent.click(filterButton);

    const companyFilterButton = canvas.getByText('Company', { selector: 'li' });
    await userEvent.click(companyFilterButton);

    const companyNameInput = canvas.getByPlaceholderText('Company');
    await userEvent.type(companyNameInput, 'Qon', {
      delay: 200,
    });

    const qontoChip = canvas.getByText('Qonto', { selector: 'li' });
    await userEvent.click(qontoChip);

    expect(await canvas.findByText('Alexandre Prot')).toBeInTheDocument();
    await expect(canvas.queryAllByText('John Doe')).toStrictEqual([]);

    expect(await canvas.findByText('Company:')).toBeInTheDocument();
    expect(await canvas.findByText('Is Qonto')).toBeInTheDocument();
  },
  parameters: {
    msw: mocks,
  },
};
