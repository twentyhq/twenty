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
  title: 'Pages/People/SortBy',
  component: People,
  decorators: [PageDecorator],
  args: { routePath: AppPath.PeoplePage },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

const peopleEmails = mockedPeopleData.map(({ email }) => email);
const sortedPeopleEmails = peopleEmails.toSorted();

export const Email: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for rows to appear', async () => {
      await canvas.findByText(
        mockedPeopleData[0].displayName,
        {},
        { timeout: 3000 },
      );
    });

    await step('Click on sort button', async () => {
      const sortButton = canvas.getByRole('button', { name: 'Sort' });
      await userEvent.click(sortButton);
    });

    await step('Select sort by email', async () => {
      const emailSortButton = canvas.getByTestId('select-sort-2');
      await userEvent.click(emailSortButton);

      await canvas.findByTestId('remove-icon-email', {}, { timeout: 3000 });
    });

    await sleep(1000);

    await step('Check rows are sorted by email', async () => {
      const emailCells = canvas.getAllByText(
        (_, element) =>
          sortedPeopleEmails.some((email) =>
            element?.textContent?.includes(email),
          ),
        { selector: '[data-testid="editable-cell-display-mode"]' },
      );

      expect(emailCells).toHaveLength(sortedPeopleEmails.length);

      sortedPeopleEmails.forEach((email, index) =>
        expect(emailCells[index]).toHaveTextContent(email),
      );
    });
  },
};

export const Reset: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for rows to appear', async () => {
      await canvas.findByText(
        mockedPeopleData[0].displayName,
        {},
        { timeout: 3000 },
      );
    });

    await step('Click on sort button', async () => {
      const sortButton = canvas.getByRole('button', { name: 'Sort' });
      await userEvent.click(sortButton);
    });

    await step('Select sort by email', async () => {
      const emailSortButton = canvas.getByTestId('select-sort-2');
      await userEvent.click(emailSortButton);

      expect(
        await canvas.findByTestId('remove-icon-email'),
      ).toBeInTheDocument();
    });

    await step('Click on reset button', async () => {
      const resetButton = canvas.getByRole('button', { name: 'Reset' });
      await userEvent.click(resetButton);

      expect(canvas.queryByTestId('remove-icon-email')).toBeNull();
    });

    await step('Check rows are in initial order', async () => {
      const emailCells = canvas.getAllByText(
        (_, element) =>
          peopleEmails.some((email) => element?.textContent?.includes(email)),
        { selector: '[data-testid="editable-cell-display-mode"]' },
      );

      expect(emailCells).toHaveLength(peopleEmails.length);

      peopleEmails.forEach((email, index) =>
        expect(emailCells[index]).toHaveTextContent(email),
      );
    });
  },
};
