import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import People from '../People';
import { Story } from './People.stories';
import { mocks, render } from './shared';
import { mockedPeopleData } from '../../../testing/mock-data/people';

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

    await new Promise((resolve) => setTimeout(resolve, 25));

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeNull();

    await userEvent.click(secondRowEmailCell);

    await new Promise((resolve) => setTimeout(resolve, 25));

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeInTheDocument();
  },
  parameters: {
    msw: mocks,
  },
};
