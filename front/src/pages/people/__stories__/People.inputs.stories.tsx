import { expect } from '@storybook/jest';
import { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import assert from 'assert';

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
  title: 'Pages/People/Input',
  component: People,
  decorators: [PageDecorator],
  args: { routePath: AppPath.PeoplePage },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export const InteractWithManyRows: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const firstRowEmailCell = await canvas.findByText(
      mockedPeopleData[0].email,
      {},
      { timeout: 3000 },
    );
    assert(firstRowEmailCell.parentElement);

    const secondRowEmailCell = canvas.getByText(mockedPeopleData[1].email);
    assert(secondRowEmailCell.parentElement);

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeNull();

    await userEvent.click(firstRowEmailCell.parentElement);

    expect(
      canvas.getByTestId('editable-cell-edit-mode-container'),
    ).toBeVisible();

    await userEvent.click(secondRowEmailCell.parentElement);

    await sleep(25);

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeNull();

    await userEvent.click(secondRowEmailCell.parentElement);

    expect(
      canvas.getByTestId('editable-cell-edit-mode-container'),
    ).toBeVisible();
  },
};

export const CheckCheckboxes: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for rows to appear', async () => {
      await canvas.findByText(
        mockedPeopleData[0].displayName,
        {},
        { timeout: 3000 },
      );
    });

    const [, firstRowCheckbox, secondRowCheckbox] =
      canvas.getAllByRole<HTMLInputElement>('checkbox');

    await step('Select first row', async () => {
      assert(firstRowCheckbox.parentElement);

      await userEvent.click(firstRowCheckbox.parentElement);
      await sleep(25);

      expect(firstRowCheckbox).toBeChecked();
    });

    await step('Select second row', async () => {
      await userEvent.click(secondRowCheckbox);
      await sleep(25);

      expect(secondRowCheckbox).toBeChecked();
    });

    await step('Unselect second row', async () => {
      assert(secondRowCheckbox.parentElement);

      await userEvent.click(secondRowCheckbox.parentElement);
      await sleep(25);

      expect(secondRowCheckbox).not.toBeChecked();
    });
  },
};

export const EditRelation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Click on third row company cell', async () => {
      const thirdRowCompanyCell = await canvas.findByText(
        mockedPeopleData[2].company.name,
        {},
        { timeout: 3000 },
      );

      await userEvent.click(thirdRowCompanyCell);
    });

    await step('Type "Air" in relation picker', async () => {
      const relationSearchInput = canvas.getByPlaceholderText('Search');

      await userEvent.type(relationSearchInput, 'Air', { delay: 200 });
    });

    await step('Select "Airbnb"', async () => {
      const airbnbChip = await canvas.findByRole('listitem', {
        name: (_, element) => !!element?.textContent?.includes('Airbnb'),
      });

      await userEvent.click(airbnbChip);
    });

    await step('Check if Airbnb is in the table', async () => {
      expect(
        await canvas.findByText('Airbnb', {}, { timeout: 3000 }),
      ).toBeVisible();
    });
  },
};

export const SelectRelationWithKeys: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Click on first row company cell', async () => {
      const firstRowCompanyCell = await canvas.findByText(
        mockedPeopleData[0].company.name,
        {},
        { timeout: 3000 },
      );

      await userEvent.click(firstRowCompanyCell);
    });

    const relationSearchInput = canvas.getByPlaceholderText('Search');

    await step('Type "Air" in relation picker', async () => {
      await userEvent.type(relationSearchInput, 'Air', { delay: 200 });
    });

    await step('Select "Aircall"', async () => {
      await userEvent.keyboard('{arrowdown}');

      await sleep(50);

      await userEvent.keyboard('{arrowup}');

      await sleep(50);

      await userEvent.keyboard('{arrowdown}');

      await sleep(50);

      await userEvent.keyboard('{arrowdown}');

      await sleep(50);

      await userEvent.keyboard('{arrowdown}');

      await sleep(50);

      await userEvent.keyboard('{enter}');
    });

    await step('Check if Aircall is in the table', async () => {
      expect(
        await canvas.findByText('Aircall', {}, { timeout: 3000 }),
      ).toBeVisible();
    });
  },
};
