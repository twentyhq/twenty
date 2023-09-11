import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import assert from 'assert';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

import { People } from '../People';

import { Story } from './People.stories';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/People/FilterBy',
  component: People,
  decorators: [PageDecorator],
  args: { routePath: AppPath.PeoplePage },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export const Email: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = await canvas.findByText('Filter');
    await userEvent.click(filterButton);

    const emailFilterButton = await canvas.findByTestId('select-filter-2');

    assert(emailFilterButton);

    await userEvent.click(emailFilterButton);

    const emailInput = canvas.getByPlaceholderText('Email');

    await userEvent.type(emailInput, 'al', {
      delay: 200,
    });

    await sleep(100);

    expect(await canvas.findByText('Alexandre Prot')).toBeInTheDocument();
    await expect(canvas.queryAllByText('John Doe')).toStrictEqual([]);

    const emailFilter = canvas.getAllByText('Email').find((item) => {
      return item.parentElement?.textContent?.includes('Email:  al');
    });
    expect(emailFilter).toBeInTheDocument();
  },
};

export const CompanyName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = await canvas.findByText('Filter');
    await userEvent.click(filterButton);

    const companyFilterButton = await canvas.findByTestId('select-filter-3');

    assert(companyFilterButton);

    await userEvent.click(companyFilterButton);

    const companyNameInput = canvas.getByPlaceholderText('Company');
    await userEvent.type(companyNameInput, 'Qon', {
      delay: 200,
    });

    await sleep(500);

    const qontoChip = (await canvas.findAllByTestId('menu-item')).find(
      (item) => {
        return item.textContent?.includes('Qonto');
      },
    );

    expect(qontoChip).toBeInTheDocument();

    assert(qontoChip);

    await userEvent.click(qontoChip);

    // TODO: fix msw where clauses
    // expect(await canvas.findByText('Alexandre Prot')).toBeInTheDocument();
    // await expect(canvas.queryAllByText('John Doe')).toStrictEqual([]);

    const companyFilter = canvas.getAllByText('Company').find((item) => {
      return item.parentElement?.textContent?.includes('Company:  Qonto');
    });
    expect(companyFilter).toBeInTheDocument();
  },
};
