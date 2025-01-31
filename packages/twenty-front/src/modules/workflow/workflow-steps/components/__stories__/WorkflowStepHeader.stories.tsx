import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { ComponentDecorator, IconPlus, THEME_LIGHT } from 'twenty-ui';
import { WorkflowStepHeader } from '../WorkflowStepHeader';

const meta: Meta<typeof WorkflowStepHeader> = {
  title: 'Modules/Workflow/WorkflowStepHeader',
  component: WorkflowStepHeader,
  args: {
    onTitleChange: fn(),
  },
  argTypes: {},
  decorators: [ComponentDecorator],
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

    expect(await canvas.findByDisplayValue('Create Record')).toBeVisible();
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

    const titleInput = await canvas.findByDisplayValue('Create Record');

    const NEW_TITLE = 'New Title';

    await userEvent.clear(titleInput);

    await waitFor(() => {
      expect(args.onTitleChange).toHaveBeenCalledWith('');
    });

    await userEvent.type(titleInput, NEW_TITLE);

    await waitFor(() => {
      expect(args.onTitleChange).toHaveBeenCalledWith(NEW_TITLE);
    });

    expect(args.onTitleChange).toHaveBeenCalledTimes(2);
    expect(titleInput).toHaveValue(NEW_TITLE);
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

    const titleInput = await canvas.findByDisplayValue('Create Record');
    expect(titleInput).toBeDisabled();

    const NEW_TITLE = 'New Title';

    await userEvent.type(titleInput, NEW_TITLE);

    expect(args.onTitleChange).not.toHaveBeenCalled();
    expect(titleInput).toHaveValue('Create Record');
  },
};
