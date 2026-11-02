import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { SettingsAiBehaviorSection } from '~/pages/settings/ai/components/SettingsAiBehaviorSection';

type SettingsAiBehaviorStoryArgs = ComponentProps<
  typeof SettingsAiBehaviorSection
> & {
  shouldRejectChanges?: boolean;
};

const meta = {
  title: 'Pages/Settings/AI/Behavior',
  component: SettingsAiBehaviorSection,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 694 } },
  args: {
    directMessageMode: 'MENTION_ONLY',
    inboxMode: 'AUTOMATIC',
    onDirectMessageModeChange: fn(),
    onInboxModeChange: fn(),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<SettingsAiBehaviorStoryArgs>();

    return (
      <SettingsAiBehaviorSection
        directMessageMode={args.directMessageMode}
        inboxMode={args.inboxMode}
        onDirectMessageModeChange={(value) => {
          args.onDirectMessageModeChange(value);

          if (args.shouldRejectChanges) {
            return;
          }

          updateArgs({ directMessageMode: value });
        }}
        onInboxModeChange={(value) => {
          args.onInboxModeChange(value);

          if (args.shouldRejectChanges) {
            return;
          }

          updateArgs({ inboxMode: value });
        }}
        isLoading={args.isLoading}
        disabled={args.disabled}
        errorMessage={args.errorMessage}
      />
    );
  },
} satisfies Meta<SettingsAiBehaviorStoryArgs>;

export default meta;
type Story = StoryObj<SettingsAiBehaviorStoryArgs>;

export const IndependentSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const directMessages = canvas.getByRole('combobox', { name: 'DMs' });
    const inbox = canvas.getByRole('combobox', { name: 'Global inbox' });
    const document = within(canvasElement.ownerDocument.body);

    expect(canvas.getByRole('status')).toBeEmptyDOMElement();
    expect(directMessages).toHaveTextContent('Only when mentioned');
    expect(inbox).toHaveTextContent('Auto');
    await userEvent.click(directMessages);
    const directMessageOptions = await document.findByRole('listbox');

    await userEvent.click(
      within(directMessageOptions).getByRole('option', { name: 'Never' }),
    );
    await waitFor(() => expect(directMessages).toHaveTextContent('Never'));
    expect(directMessages).toHaveFocus();
    expect(args.onDirectMessageModeChange).toHaveBeenLastCalledWith('NEVER');
    expect(args.onInboxModeChange).not.toHaveBeenCalled();
    expect(inbox).toHaveTextContent('Auto');

    await userEvent.click(inbox);
    await document.findByRole('listbox');
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}');
    await waitFor(() => expect(inbox).toHaveTextContent('Only when mentioned'));
    expect(args.onInboxModeChange).toHaveBeenCalledOnce();
    expect(args.onInboxModeChange).toHaveBeenLastCalledWith('MENTION_ONLY');
    expect(directMessages).toHaveTextContent('Never');
    expect(inbox).toHaveFocus();

    await userEvent.click(directMessages);
    await document.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await waitFor(() => expect(directMessages).toHaveFocus());
    expect(args.onDirectMessageModeChange).toHaveBeenCalledOnce();
    expect(directMessages).toHaveTextContent('Never');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    for (const name of ['DMs', 'Global inbox']) {
      const trigger = canvas.getByRole('combobox', { name });

      expect(trigger).toHaveAttribute('data-disabled');
      await userEvent.click(trigger);
    }

    expect(
      within(canvasElement.ownerDocument.body).queryByRole('listbox'),
    ).not.toBeInTheDocument();
    expect(args.onDirectMessageModeChange).not.toHaveBeenCalled();
    expect(args.onInboxModeChange).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  args: { directMessageMode: null, inboxMode: null, isLoading: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('status')).toHaveTextContent(
      'Loading behavior settings...',
    );

    for (const trigger of canvas.getAllByRole('combobox')) {
      expect(trigger).toHaveAttribute('data-disabled');
      expect(trigger).toHaveTextContent('Loading...');
      await userEvent.click(trigger);
    }

    expect(args.onDirectMessageModeChange).not.toHaveBeenCalled();
    expect(args.onInboxModeChange).not.toHaveBeenCalled();
  },
};

export const FailedChange: Story = {
  args: {
    errorMessage: 'Unable to save behavior settings. Try again.',
    shouldRejectChanges: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const directMessages = canvas.getByRole('combobox', { name: 'DMs' });
    const inbox = canvas.getByRole('combobox', { name: 'Global inbox' });

    expect(canvas.getByRole('alert')).toHaveTextContent(
      'Unable to save behavior settings. Try again.',
    );
    expect(directMessages).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(directMessages);
    const options = await within(canvasElement.ownerDocument.body).findByRole(
      'listbox',
    );

    await userEvent.click(
      within(options).getByRole('option', { name: 'Never' }),
    );
    expect(args.onDirectMessageModeChange).toHaveBeenCalledOnce();
    expect(args.onDirectMessageModeChange).toHaveBeenLastCalledWith('NEVER');
    await waitFor(() =>
      expect(directMessages).toHaveTextContent('Only when mentioned'),
    );
    expect(inbox).toHaveTextContent('Auto');
    expect(args.onInboxModeChange).not.toHaveBeenCalled();
  },
};

export const Narrow: Story = {
  parameters: { container: { width: 320 } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const directMessages = canvas.getByRole('combobox', { name: 'DMs' });
    const inbox = canvas.getByRole('combobox', { name: 'Global inbox' });

    expect(directMessages).toBeVisible();
    expect(inbox).toBeVisible();
    await userEvent.click(directMessages);
    const options = await within(canvasElement.ownerDocument.body).findByRole(
      'listbox',
    );

    await userEvent.click(
      within(options).getByRole('option', { name: 'Never' }),
    );
    await waitFor(() => expect(directMessages).toHaveTextContent('Never'));
    expect(args.onDirectMessageModeChange).toHaveBeenCalledOnce();
    expect(args.onDirectMessageModeChange).toHaveBeenLastCalledWith('NEVER');
    expect(args.onInboxModeChange).not.toHaveBeenCalled();
    await waitFor(() => expect(directMessages).toHaveFocus());
    await userEvent.tab();
    expect(inbox).toHaveFocus();
    expect(inbox).toHaveTextContent('Auto');
  },
};
