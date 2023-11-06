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
  title: 'Pages/Companies/Add',
  component: Companies,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CompaniesPage },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export const AddNewCompany: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for rows to appear', async () => {
      await canvas.findByText(
        mockedCompaniesData[0].name,
        {},
        { timeout: 3000 },
      );
    });

    const rowsBeforeAdd = canvas.getAllByRole('row');

    await step('Click on add button', async () => {
      const addButton = canvas.getByRole('button', { name: 'Add' });

      await userEvent.click(addButton);
    });

    await sleep(1000);

    await step('Check an empty row has been added', async () => {
      const rowsAfterAdd = canvas.getAllByRole('row');

      const firstRow = rowsAfterAdd[1];
      const cells = within(firstRow).getAllByRole('cell');

      expect(cells[1].textContent).toBe('');
      expect(rowsAfterAdd).toHaveLength(rowsBeforeAdd.length + 1);
    });
  },
};
