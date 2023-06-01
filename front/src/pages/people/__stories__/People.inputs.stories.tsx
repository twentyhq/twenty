import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import People from '../People';
import { Story } from './People.stories';
import { mocks, render } from './shared';
import { mockedPeopleData } from '../../../testing/mock-data/people';
import { sleep } from '../../../testing/sleep';

const meta: Meta<typeof People> = {
  title: 'Pages/People',
  component: People,
};

export default meta;

export const ChangeEmail: Story = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const firstRowEmailCell = await canvas.findByText(
      mockedPeopleData[0].email,
    );

    const secondRowEmailCell = await canvas.findByText(
      mockedPeopleData[1].email,
    );

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeNull();

    await userEvent.click(firstRowEmailCell);

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeInTheDocument();

    await userEvent.click(secondRowEmailCell);

    await sleep(25);

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeNull();

    await userEvent.click(secondRowEmailCell);

    await sleep(25);

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeInTheDocument();
  },
  parameters: {
    msw: mocks,
  },
};

export const Checkbox: Story = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(500);

    const inputCheckboxContainers = await canvas.findAllByTestId(
      'input-checkbox-cell-container',
    );

    const inputCheckboxes = await canvas.findAllByTestId('input-checkbox');

    const secondCheckboxContainer = inputCheckboxContainers[1];
    const secondCheckbox = inputCheckboxes[1] as HTMLInputElement;

    expect(secondCheckboxContainer).toBeDefined();

    await userEvent.click(secondCheckboxContainer);

    expect(secondCheckbox.checked).toBe(true);

    await userEvent.click(secondCheckbox);

    expect(secondCheckbox.checked).toBe(false);
  },
  parameters: {
    msw: mocks,
  },
};
