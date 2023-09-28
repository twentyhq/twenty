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

    await sleep(2000);

    const rowsBeforeAdd = canvas.getAllByRole('row');

    const addButton = canvas.getByRole('button', { name: 'Add' });

    userEvent.click(addButton);

    await sleep(1000);

    const rowsAfterAdd = canvas.getAllByRole('row');

    const firstRow = rowsAfterAdd[1];
    const cells = within(firstRow).getAllByRole('cell');

    expect(cells[1].textContent).toBe('');

    expect(rowsAfterAdd).toHaveLength(rowsBeforeAdd.length + 1);
  },
};
