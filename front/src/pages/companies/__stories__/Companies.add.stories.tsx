import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

import { Companies } from '../Companies';

import { Story } from './Companies.stories';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Companies/Add',
  component: Companies,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CompaniesPage },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export const AddNewCompany: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const table = await canvas.findByRole('table');

    const tableBody = await within(table).findByTestId('t-body');

    const rowsBeforeAdd = within(tableBody).getAllByRole('row');

    const addButton = await canvas.findByTestId('add-button');

    userEvent.click(addButton);

    await sleep(200);

    const rowsAfterAdd = within(tableBody).getAllByRole('row');

    const firstRow = rowsAfterAdd[0];
    const cells = within(firstRow).getAllByRole('cell');

    cells.forEach((cell, index) => {
      // empty name
      if (index === 1) {
        expect(cell.textContent).toBe('');
      }
    });

    expect(rowsAfterAdd.length).toBe(rowsBeforeAdd.length + 1);
  },
};
