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
  title: 'Pages/People/FilterBy',
  component: People,
  decorators: [PageDecorator],
  args: { routePath: AppPath.PeoplePage },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

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

    await step('Click on filter button', async () => {
      const filterButton = canvas.getByText('Filter');
      await userEvent.click(filterButton);
    });

    await step('Select email filter', async () => {
      const emailFilterButton = canvas.getByTestId('select-filter-2');
      await userEvent.click(emailFilterButton);

      const emailInput = canvas.getByPlaceholderText('Email');
      await userEvent.type(emailInput, 'al', { delay: 200 });

      const emailFilter = canvas.getAllByText(
        (_, element) => !!element?.textContent?.includes('Email:  al'),
      );
      expect(emailFilter).not.toHaveLength(0);
    });

    await sleep(1000);

    await step('Check filtered rows', async () => {
      expect(canvas.getByText('Alexandre Prot')).toBeVisible();
      expect(canvas.queryByText('John Doe')).toBeNull();
    });
  },
};

export const CompanyName: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for rows to appear', async () => {
      await canvas.findByText(
        mockedPeopleData[0].displayName,
        {},
        { timeout: 3000 },
      );
    });

    await step('Click on filter button', async () => {
      const filterButton = canvas.getByText('Filter');
      await userEvent.click(filterButton);
    });

    await step('Select company filter', async () => {
      const companyFilterButton = canvas.getByTestId('select-filter-3');
      await userEvent.click(companyFilterButton);

      const companyNameInput = canvas.getByPlaceholderText('Company');
      await userEvent.type(companyNameInput, 'Qon', { delay: 200 });

      const qontoChip = await canvas.findByRole(
        'listitem',
        { name: (_, element) => !!element?.textContent?.includes('Qonto') },
        { timeout: 1000 },
      );
      await userEvent.click(qontoChip);

      const companyFilter = canvas.getAllByText(
        (_, element) => !!element?.textContent?.includes('Company:  Qonto'),
      );
      expect(companyFilter).not.toHaveLength(0);
    });

    await sleep(1000);

    await step('Check filtered rows', async () => {
      expect(canvas.getByText('Alexandre Prot')).toBeVisible();
      expect(canvas.queryByText('John Doe')).toBeNull();
    });
  },
};
