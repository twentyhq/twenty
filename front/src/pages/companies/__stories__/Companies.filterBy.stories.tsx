import { expect } from '@storybook/jest';
import { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { sleep } from '~/testing/sleep';

import { Companies } from '../Companies';

import { Story } from './Companies.stories';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Companies/FilterBy',
  component: Companies,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CompaniesPage },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export const FilterByName: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for rows to appear', async () => {
      await canvas.findByText(
        mockedCompaniesData[0].name,
        {},
        { timeout: 3000 },
      );
    });

    await step('Click on filter button', async () => {
      const filterButton = canvas.getByText('Filter');
      await userEvent.click(filterButton);
    });

    await step('Select name filter', async () => {
      const nameFilterButton = canvas.getByTestId('select-filter-0');
      await userEvent.click(nameFilterButton);

      const nameInput = canvas.getByPlaceholderText('Name');
      await userEvent.type(nameInput, 'Air', { delay: 200 });

      const nameFilter = canvas.getAllByText(
        (_, element) => !!element?.textContent?.includes('Name:  Air'),
      );
      expect(nameFilter).not.toHaveLength(0);
    });

    await sleep(1000);

    await step('Check filtered rows', async () => {
      expect(canvas.getByText('Airbnb')).toBeVisible();
      expect(canvas.getByText('Aircall')).toBeVisible();
      expect(canvas.queryByText('Qonto')).toBeNull();
    });
  },
};

export const FilterByAccountOwner: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for rows to appear', async () => {
      await canvas.findByText(
        mockedCompaniesData[0].name,
        {},
        { timeout: 3000 },
      );
    });

    await step('Click on filter button', async () => {
      const filterButton = canvas.getByText('Filter');
      await userEvent.click(filterButton);
    });

    await step('Select account owner filter', async () => {
      const accountOwnerFilterButton = canvas.getByTestId('select-filter-5');
      await userEvent.click(accountOwnerFilterButton);

      const accountOwnerNameInput =
        canvas.getByPlaceholderText('Account owner');
      await userEvent.type(accountOwnerNameInput, 'Char', { delay: 200 });

      const charlesChip = await canvas.findByRole(
        'listitem',
        {
          name: (_, element) =>
            !!element?.textContent?.includes('Charles Test'),
        },
        { timeout: 1000 },
      );
      await userEvent.click(charlesChip);

      const accountOwnerFilter = canvas.getAllByText(
        (_, element) =>
          !!element?.textContent?.includes('Account owner:  Charles Test'),
      );
      expect(accountOwnerFilter).not.toHaveLength(0);
    });

    await sleep(1000);

    await step('Check filtered rows', async () => {
      expect(canvas.getByText('Airbnb')).toBeVisible();
      expect(canvas.queryByText('Qonto')).toBeNull();
    });
  },
};
