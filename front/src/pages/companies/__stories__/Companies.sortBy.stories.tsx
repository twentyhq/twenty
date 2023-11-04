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
  title: 'Pages/Companies/SortBy',
  component: Companies,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CompaniesPage },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

const sortedCompanyNames = mockedCompaniesData
  .map(({ name }) => name)
  .toSorted();

export const SortByName: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for rows to appear', async () => {
      await canvas.findByText(
        mockedCompaniesData[0].name,
        {},
        { timeout: 3000 },
      );
    });

    await step('Click on sort button', async () => {
      const sortButton = canvas.getByRole('button', { name: 'Sort' });
      await userEvent.click(sortButton);
    });

    await step('Select sort by name', async () => {
      const nameSortButton = canvas.getByTestId('select-sort-0');
      await userEvent.click(nameSortButton);

      await canvas.findByTestId('remove-icon-name', {}, { timeout: 3000 });
    });

    await sleep(1000);

    await step('Check rows are sorted by name', async () => {
      const nameCells = canvas.getAllByText(
        (_, element) =>
          sortedCompanyNames.some((name) =>
            element?.textContent?.includes(name),
          ),
        { selector: '[data-testid="editable-cell-display-mode"]' },
      );

      expect(nameCells).toHaveLength(sortedCompanyNames.length);

      sortedCompanyNames.forEach((name, index) =>
        expect(nameCells[index]).toHaveTextContent(name),
      );
    });
  },
};
