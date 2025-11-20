import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { IconPlus } from 'twenty-ui/display';
import { ComponentDecorator } from 'twenty-ui/testing';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { SidePanelHeader } from '../SidePanelHeader';

const meta: Meta<typeof SidePanelHeader> = {
  title: 'Modules/CommandMenu/SidePanelHeader',
  component: SidePanelHeader,
  args: {
    onTitleChange: fn(),
  },
  argTypes: {},
  decorators: [
    ComponentDecorator,
    (Story) => (
      <CommandMenuPageComponentInstanceContext.Provider
        value={{ instanceId: 'side-panel-header-story-instance' }}
      >
        <Story />
      </CommandMenuPageComponentInstanceContext.Provider>
    ),
  ],
  parameters: {
    disableHotkeyInitialization: true,
  },
};

export default meta;

type Story = StoryObj<typeof SidePanelHeader>;

export const Default: Story = {
  args: {
    headerType: 'Action',
    iconColor: THEME_LIGHT.font.color.tertiary,
    initialTitle: 'Create Record',
    Icon: IconPlus,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

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
    const titleText = await canvas.findByText('Create Record');
    await userEvent.click(titleText);

    const titleInput = await canvas.findByDisplayValue('Create Record');

    const NEW_TITLE = 'New Title';

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, NEW_TITLE);

    await userEvent.keyboard('{Enter}');

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

    const titleText = await canvas.findByText('Create Record');

    expect(window.getComputedStyle(titleText).cursor).toBe('default');

    await userEvent.click(titleText);

    const titleInput = canvas.queryByDisplayValue('Create Record');
    expect(titleInput).not.toBeInTheDocument();

    expect(args.onTitleChange).not.toHaveBeenCalled();
  },
};
