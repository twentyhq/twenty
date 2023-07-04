import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import assert from 'assert';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';
import { sleep } from '~/testing/sleep';

import { People } from '../People';

import { Story } from './People.stories';

const meta: Meta<typeof People> = {
  title: 'Pages/People/FilterBy',
  component: People,
};

export default meta;

export const Email: Story = {
  render: getRenderWrapperForPage(<People />, '/people'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = canvas.getByText('Filter');
    await userEvent.click(filterButton);

    const emailFilterButton = canvas
      .getAllByTestId('dropdown-menu-item')
      .find((item) => {
        return item.textContent?.includes('Email');
      });

    assert(emailFilterButton);

    await userEvent.click(emailFilterButton);

    const emailInput = canvas.getByPlaceholderText('Email');
    await userEvent.type(emailInput, 'al', {
      delay: 200,
    });

    await sleep(1000);

    expect(await canvas.findByText('Alexandre Prot')).toBeInTheDocument();
    await expect(canvas.queryAllByText('John Doe')).toStrictEqual([]);

    expect(await canvas.findByText('Email:')).toBeInTheDocument();
    expect(await canvas.findByText('Contains al')).toBeInTheDocument();
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export const CompanyName: Story = {
  render: getRenderWrapperForPage(<People />, '/people'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = canvas.getByText('Filter');
    await userEvent.click(filterButton);

    const companyFilterButton = canvas
      .getAllByTestId('dropdown-menu-item')
      .find((item) => {
        return item.textContent?.includes('Company');
      });

    assert(companyFilterButton);

    await userEvent.click(companyFilterButton);

    const companyNameInput = canvas.getByPlaceholderText('Company');
    await userEvent.type(companyNameInput, 'Qon', {
      delay: 200,
    });

    await sleep(1000);

    const qontoChip = canvas
      .getAllByTestId('dropdown-menu-item')
      .find((item) => {
        return item.textContent?.includes('Qonto');
      });

    expect(qontoChip).toBeInTheDocument();

    assert(qontoChip);

    await userEvent.click(qontoChip);

    // TODO: fix msw where clauses
    // expect(await canvas.findByText('Alexandre Prot')).toBeInTheDocument();
    // await expect(canvas.queryAllByText('John Doe')).toStrictEqual([]);

    expect(await canvas.findByText('Company:')).toBeInTheDocument();
    expect(await canvas.findByText('Is Qonto')).toBeInTheDocument();
  },
  parameters: {
    msw: graphqlMocks,
  },
};
