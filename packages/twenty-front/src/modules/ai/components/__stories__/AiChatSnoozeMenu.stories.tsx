import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatSnoozeMenu } from '@/ai/components/AiChatSnoozeMenu';
import { getAgentChatThreadSnoozeOptions } from '@/ai/utils/getAgentChatThreadSnoozeOptions';

const SNOOZE_PREVIEW_TIME_ZONE = 'UTC';
const SNOOZE_PREVIEW_DATE = new Date('2026-10-21T15:00:00Z');
const snoozePresetDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: SNOOZE_PREVIEW_TIME_ZONE,
});

const ControlledSnoozeMenu = ({
  open: initialOpen,
  onOpenChange,
  presets,
  onSelectPreset,
  onPickDate,
  onSomeoneReplies,
  onAssistantFinishes,
  assistantName,
  disabled,
}: ComponentProps<typeof AiChatSnoozeMenu>) => {
  const [open, setOpen] = useState(initialOpen);

  return (
    <AiChatSnoozeMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        onOpenChange(nextOpen);
      }}
      presets={presets}
      onSelectPreset={onSelectPreset}
      onPickDate={onPickDate}
      onSomeoneReplies={onSomeoneReplies}
      onAssistantFinishes={onAssistantFinishes}
      assistantName={assistantName}
      disabled={disabled}
    />
  );
};

const meta: Meta<typeof AiChatSnoozeMenu> = {
  title: 'Modules/AI/AiChatSnoozeMenu',
  component: AiChatSnoozeMenu,
  decorators: [ComponentDecorator],
  render: ControlledSnoozeMenu,
  parameters: { container: { width: 320, height: 360 } },
  args: {
    open: false,
    onOpenChange: fn(),
    presets: getAgentChatThreadSnoozeOptions({
      now: SNOOZE_PREVIEW_DATE,
      timeZone: SNOOZE_PREVIEW_TIME_ZONE,
    }).map((option) => ({
      ...option,
      description: snoozePresetDateFormatter.format(option.date),
    })),
    onSelectPreset: fn(),
    onPickDate: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AiChatSnoozeMenu>;

export const TimedPresets: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Snooze' });

    await userEvent.click(trigger);
    await expect(await body.findByRole('menu')).toBeVisible();
    await expect(
      body.queryByRole('menuitem', { name: 'Someone replies' }),
    ).not.toBeInTheDocument();
    await userEvent.click(body.getByRole('menuitem', { name: /Tomorrow/ }));
    await expect(args.onSelectPreset).toHaveBeenCalledWith('tomorrow');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Pick a date' }),
    );
    await expect(args.onPickDate).toHaveBeenCalledTimes(1);
  },
};

export const EventWaits: Story = {
  args: { onSomeoneReplies: fn(), onAssistantFinishes: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Snooze',
    });
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Someone replies' }),
    );
    await expect(args.onSomeoneReplies).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'When Ada finishes' }),
    );
    await expect(args.onAssistantFinishes).toHaveBeenCalledTimes(1);
    await expect(args.onSelectPreset).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Snooze',
    });

    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('menu'),
    ).not.toBeInTheDocument();
  },
};
