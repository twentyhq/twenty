import { expect } from '@storybook/jest';
import { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPeopleData } from '~/testing/mock-data/people';
import { sleep } from '~/testing/sleep';

import { People } from '../People';

import { Story } from './People.stories';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/People/Add',
  component: People,
  decorators: [PageDecorator],
  args: { routePath: AppPath.PeoplePage },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export const AddNewPerson: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for rows to appear', async () => {
      await canvas.findByText(
        mockedPeopleData[0].displayName,
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
