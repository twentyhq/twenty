import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import assert from 'assert';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

import { Companies } from '../Companies';

import { Story } from './Companies.stories';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Companies/FilterBy',
  component: Companies,
  decorators: [PageDecorator],
  args: { currentPath: '/companies' },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export const FilterByName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = await canvas.findByText('Filter');
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

    const accountOwnerFilter = canvas.getAllByText('Name').find((item) => {
      return item.parentElement?.textContent?.includes('Name:  Air');
    });
    expect(accountOwnerFilter).toBeInTheDocument();
  },
};

export const FilterByAccountOwner: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = await canvas.findByText('Filter');
    await userEvent.click(filterButton);

    const accountOwnerFilterButton = (
      await canvas.findAllByTestId('dropdown-menu-item')
    ).find((item) => {
      return item.textContent === 'Account owner';
    });

    assert(accountOwnerFilterButton);

    await userEvent.click(accountOwnerFilterButton);

    const accountOwnerNameInput = await canvas.findByPlaceholderText(
      'Account owner',
    );
    await userEvent.type(accountOwnerNameInput, 'Char', {
      delay: 200,
    });

    await sleep(1000);

    const charlesChip = canvas
      .getAllByTestId('dropdown-menu-item')
      .find((item) => {
        return item.textContent?.includes('Charles Test');
      });

    assert(charlesChip);

    await userEvent.click(charlesChip);

    // TODO: fix msw where clauses
    // expect(await canvas.findByText('Airbnb')).toBeInTheDocument();
    // await expect(canvas.queryAllByText('Qonto')).toStrictEqual([]);

    const accountOwnerFilter = canvas
      .getAllByText('Account owner')
      .find((item) => {
        return item.parentElement?.textContent?.includes(
          'Account owner:  Charles Test',
        );
      });
    expect(accountOwnerFilter).toBeInTheDocument();
  },
};
