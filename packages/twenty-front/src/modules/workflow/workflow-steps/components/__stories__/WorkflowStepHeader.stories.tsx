import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { IconPlus } from 'twenty-ui/display';
import { ComponentDecorator } from 'twenty-ui/testing';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { WorkflowStepHeader } from '../WorkflowStepHeader';

const meta: Meta<typeof WorkflowStepHeader> = {
  title: 'Modules/Workflow/WorkflowStepHeader',
  component: WorkflowStepHeader,
  args: {
    onTitleChange: fn(),
  },
  argTypes: {},
  decorators: [ComponentDecorator],
  parameters: {
    disableHotkeyInitialization: true,
  },
};

export default meta;

type Story = StoryObj<typeof WorkflowStepHeader>;

export const Default: Story = {
  args: {
    headerType: 'Action',
    iconColor: THEME_LIGHT.font.color.tertiary,
    initialTitle: 'Create Record',
    Icon: IconPlus,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // TitleInput shows text in a div when not being edited
    expect(await canvas.findByText('Create Record')).toBeVisible();
    expect(await canvas.findByText('Action')).toBeVisible();
  },
};

export const EditableTitle: Story = {
  args: {
    headerType: 'Action',
    iconColor: THEME_LIGHT.font.color.tertiary,
    initialTitle: 'Create Record',
    Icon: IconPlus,
    onTitleChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // First find the div with the text, then click it to activate the input
    const titleText = await canvas.findByText('Create Record');
    await userEvent.click(titleText);

    // Now find the input that appears after clicking
    const titleInput = await canvas.findByDisplayValue('Create Record');

    const NEW_TITLE = 'New Title';

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, NEW_TITLE);

    // Press Enter to submit the edit
    await userEvent.keyboard('{Enter}');

    // Wait for the callback to be called
    await waitFor(() => {
      expect(args.onTitleChange).toHaveBeenCalledWith(NEW_TITLE);
    });
  },
};

export const Disabled: Story = {
  args: {
    headerType: 'Action',
    iconColor: THEME_LIGHT.font.color.tertiary,
    initialTitle: 'Create Record',
    Icon: IconPlus,
    disabled: true,
    onTitleChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // When disabled, TitleInput just shows text in a div, not an input
    const titleText = await canvas.findByText('Create Record');

    // Check if the element has the disabled styling (cursor: default)
    expect(window.getComputedStyle(titleText).cursor).toBe('default');

    // Try to click it - nothing should happen
    await userEvent.click(titleText);

    // Confirm there is no input field
    const titleInput = canvas.queryByDisplayValue('Create Record');
    expect(titleInput).not.toBeInTheDocument();

    // Confirm the callback is not called
    expect(args.onTitleChange).not.toHaveBeenCalled();
  },
};
