import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { AiChatAssistantMode } from '~/generated-metadata/graphql';
import { SettingsAiBehaviorExample } from '~/pages/settings/ai/components/__stories__/SettingsAiBehaviorExample';

const meta = {
  title: 'Pages/Settings/AI/Behavior',
  component: SettingsAiBehaviorExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 694 } },
  args: {
    inboxMode: AiChatAssistantMode.AUTOMATIC,
    onInboxModeChange: fn(),
  },
} satisfies Meta<typeof SettingsAiBehaviorExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextOnlyDirectMessages: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.queryByRole('combobox', { name: 'DMs' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Global inbox' }),
    );
    const options = await within(canvasElement.ownerDocument.body).findByRole(
      'listbox',
    );

    await userEvent.click(
      within(options).getByRole('option', { name: 'Never' }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('combobox', { name: 'Global inbox' }),
      ).toHaveTextContent('Never'),
    );
    expect(args.onInboxModeChange).toHaveBeenLastCalledWith(
      AiChatAssistantMode.NEVER,
    );
  },
};

export const KeyboardSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const inbox = canvas.getByRole('combobox', { name: 'Global inbox' });
    const bodyQueries = within(canvasElement.ownerDocument.body);

    expect(canvas.getByRole('status')).toBeEmptyDOMElement();
    expect(inbox).toHaveTextContent('Auto');
    await userEvent.click(inbox);
    const inboxOptions = await bodyQueries.findByRole('listbox', {
      name: 'Global inbox',
    });

    await waitFor(() =>
      expect(
        within(inboxOptions).getByRole('option', { name: 'Auto' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}');
    await waitFor(() => expect(inbox).toHaveTextContent('Only when mentioned'));
    expect(args.onInboxModeChange).toHaveBeenCalledOnce();
    expect(args.onInboxModeChange).toHaveBeenLastCalledWith(
      AiChatAssistantMode.MENTION_ONLY,
    );
    await waitFor(() => expect(inbox).toHaveFocus());

    await userEvent.click(inbox);
    await bodyQueries.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await waitFor(() => expect(inbox).toHaveFocus());
    expect(args.onInboxModeChange).toHaveBeenCalledOnce();
    expect(inbox).toHaveTextContent('Only when mentioned');

    await userEvent.keyboard('a');
    expect(args.onInboxModeChange).toHaveBeenCalledOnce();
    expect(inbox).toHaveTextContent('Only when mentioned');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('combobox', { name: 'Global inbox' });

    expect(trigger).toHaveAttribute('data-disabled');
    await userEvent.click(trigger);

    expect(
      within(canvasElement.ownerDocument.body).queryByRole('listbox'),
    ).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('status')).toHaveTextContent(
      'Loading behavior settings...',
    );

    for (const trigger of canvas.getAllByRole('combobox')) {
      expect(trigger).toHaveAttribute('data-disabled');
      expect(trigger).toHaveTextContent('Loading...');
    }
  },
};

export const FailedChange: Story = {
  args: {
    errorMessage: 'Unable to save behavior settings. Try again.',
    shouldRejectChanges: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const inbox = canvas.getByRole('combobox', { name: 'Global inbox' });

    expect(canvas.getByRole('alert')).toHaveTextContent(
      'Unable to save behavior settings. Try again.',
    );
    expect(inbox).toHaveAccessibleDescription(
      expect.stringContaining('Unable to save behavior settings. Try again.'),
    );
    await userEvent.click(inbox);
    const options = await within(canvasElement.ownerDocument.body).findByRole(
      'listbox',
    );

    await userEvent.click(
      within(options).getByRole('option', { name: 'Never' }),
    );
    expect(args.onInboxModeChange).toHaveBeenCalledOnce();
    expect(args.onInboxModeChange).toHaveBeenLastCalledWith(
      AiChatAssistantMode.NEVER,
    );
    await waitFor(() => expect(inbox).toHaveTextContent('Auto'));
  },
};

export const Narrow: Story = {
  parameters: { container: { width: 320 } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const inbox = canvas.getByRole('combobox', { name: 'Global inbox' });

    expect(inbox).toBeVisible();
    await userEvent.click(inbox);
    const options = await within(canvasElement.ownerDocument.body).findByRole(
      'listbox',
    );

    await userEvent.click(
      within(options).getByRole('option', { name: 'Never' }),
    );
    await waitFor(() => expect(inbox).toHaveTextContent('Never'));
    expect(args.onInboxModeChange).toHaveBeenCalledOnce();
    expect(args.onInboxModeChange).toHaveBeenLastCalledWith(
      AiChatAssistantMode.NEVER,
    );
    await waitFor(() => expect(inbox).toHaveFocus());
  },
};

export const RefreshedSettings: Story = {
  render: function Render(args) {
    const [hasRefreshedSettings, setHasRefreshedSettings] = useState(false);

    return (
      <>
        <SettingsAiBehaviorExample
          inboxMode={
            hasRefreshedSettings
              ? AiChatAssistantMode.MENTION_ONLY
              : args.inboxMode
          }
          onInboxModeChange={args.onInboxModeChange}
          isLoading={args.isLoading}
          disabled={args.disabled}
          errorMessage={args.errorMessage}
          shouldRejectChanges={args.shouldRejectChanges}
        />
        <Button onClick={() => setHasRefreshedSettings(true)}>
          Refresh saved settings
        </Button>
      </>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const inbox = canvas.getByRole('combobox', { name: 'Global inbox' });

    await userEvent.click(inbox);
    const options = await within(canvasElement.ownerDocument.body).findByRole(
      'listbox',
    );
    await userEvent.click(
      within(options).getByRole('option', { name: 'Never' }),
    );
    await waitFor(() => expect(inbox).toHaveTextContent('Never'));

    await userEvent.click(
      canvas.getByRole('button', { name: 'Refresh saved settings' }),
    );
    await waitFor(() => expect(inbox).toHaveTextContent('Only when mentioned'));
    expect(args.onInboxModeChange).toHaveBeenCalledOnce();
  },
};
