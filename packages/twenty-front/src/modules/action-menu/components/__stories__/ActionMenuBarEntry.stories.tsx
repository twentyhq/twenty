import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { ComponentDecorator, IconCheckbox, IconTrash } from 'twenty-ui';
import { ActionMenuBarEntry } from '../ActionMenuBarEntry';

const meta: Meta<typeof ActionMenuBarEntry> = {
  title: 'Modules/ActionMenu/ActionMenuBarEntry',
  component: ActionMenuBarEntry,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof ActionMenuBarEntry>;

const deleteMock = jest.fn();
const markAsDoneMock = jest.fn();

export const Default: Story = {
  args: {
    entry: {
      key: 'delete',
      label: 'Delete',
      position: 0,
      Icon: IconTrash,
      onClick: deleteMock,
    },
  },
};

export const WithDangerAccent: Story = {
  args: {
    entry: {
      key: 'delete',
      label: 'Delete',
      position: 0,
      Icon: IconTrash,
      onClick: deleteMock,
      accent: 'danger',
    },
  },
};

export const WithInteraction: Story = {
  args: {
    entry: {
      key: 'markAsDone',
      label: 'Mark as done',
      position: 0,
      Icon: IconCheckbox,
      onClick: markAsDoneMock,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByText('Mark as done');
    await userEvent.click(button);
    expect(markAsDoneMock).toHaveBeenCalled();
  },
};
