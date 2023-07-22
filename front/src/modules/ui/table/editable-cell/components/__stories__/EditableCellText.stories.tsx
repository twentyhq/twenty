import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import {
  CellPositionDecorator,
  ComponentDecorator,
} from '~/testing/decorators';

import { EditableCellText } from '../../types/EditableCellText';

const meta: Meta<typeof EditableCellText> = {
  title: 'UI/EditableCell/EditableCellText',
  component: EditableCellText,
  decorators: [ComponentDecorator, CellPositionDecorator],
  args: {
    value: 'Content',
  },
};

export default meta;
type Story = StoryObj<typeof EditableCellText>;

export const DisplayMode: Story = {
  render: EditableCellText,
};

export const SoftFocusMode: Story = {
  ...DisplayMode,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Click once', () =>
      userEvent.click(canvas.getByText('Content')),
    );

    await step('Escape', () => {
      userEvent.keyboard('{esc}');
    });

    await step('Has soft focus mode', () => {
      expect(canvas.getByTestId('editable-cell-soft-focus-mode')).toBeDefined();
    });
  },
};

export const EditMode: Story = {
  ...DisplayMode,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const click = async () => userEvent.click(canvas.getByText('Content'));

    await step('Click once', click);

    await step('Has edit mode', () => {
      expect(
        canvas.getByTestId('editable-cell-edit-mode-container'),
      ).toBeDefined();
    });
  },
};
