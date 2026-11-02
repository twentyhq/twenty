import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { DirectMessagePresentationExample } from '@/ai/components/__stories__/DirectMessagePresentationExample';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const meta = {
  title: 'Modules/AI/NavigationDrawerDirectMessagesSection',
  component: DirectMessagePresentationExample,
  decorators: [ComponentDecorator, MemoryRouterDecorator],
  args: {
    onSelectThread: fn(),
    onSelectMember: fn(),
  },
} satisfies Meta<typeof DirectMessagePresentationExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SidebarSelectionAndCollapse: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const anna = canvas.getByRole('button', { name: 'Anna' });
    const felix = canvas.getByRole('button', { name: /Felix\s*, unread/ });
    const sectionTitle = canvas.getByText('DMs');

    await expect(anna).toHaveAttribute('aria-current', 'true');
    await expect(
      canvas.getByRole('button', { name: /Alice\s*, unread/ }),
    ).toBeVisible();

    felix.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onSelectThread).toHaveBeenCalledTimes(1);
    await expect(args.onSelectThread).toHaveBeenCalledWith('dm-felix');
    await expect(felix).toHaveAttribute('aria-current', 'true');
    await expect(anna).not.toHaveAttribute('aria-current');

    await userEvent.click(sectionTitle);
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Anna' }),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(sectionTitle);
    await expect(
      await canvas.findByRole('button', { name: /Felix\s*, unread/ }),
    ).toHaveAttribute('aria-current', 'true');
    await expect(args.onSelectThread).toHaveBeenCalledTimes(1);
  },
};

export const SearchAndKeyboardSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Add DM' });

    await expect(trigger).toBeVisible();
    await userEvent.click(trigger);
    const search = await body.findByRole('searchbox', {
      name: 'Search members',
    });
    await expect(body.getByRole('dialog', { name: 'Add DM' })).toBeVisible();
    await waitFor(() => expect(search).toHaveFocus());
    await expect(
      body.queryByRole('option', { name: /Raphael/ }),
    ).not.toBeInTheDocument();

    await userEvent.type(search, 'raphael');
    await expect(body.getByRole('status')).toHaveTextContent(
      'No members found',
    );
    await userEvent.clear(search);

    await userEvent.type(search, 'ali');
    await expect(body.getAllByRole('option')).toHaveLength(1);
    await expect(body.getByRole('option', { name: /Alice/ })).toBeVisible();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onSelectMember).toHaveBeenCalledTimes(1);
    await expect(args.onSelectMember).toHaveBeenCalledWith('alice');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Add DM' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.keyboard('{Enter}');
    const reopenedSearch = await body.findByRole('searchbox', {
      name: 'Search members',
    });
    await waitFor(() => expect(reopenedSearch).toHaveFocus());
    await expect(reopenedSearch).toHaveValue('');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Add DM' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(args.onSelectMember).toHaveBeenCalledTimes(1);
  },
};

export const LoadingMembers: Story = {
  args: { memberState: 'loading' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Add DM' }));

    await expect(await body.findByRole('status')).toHaveTextContent(
      'Loading members',
    );
    await expect(body.queryByRole('option')).not.toBeInTheDocument();
  },
};

export const RefreshingMembersDisablesStaleRows: Story = {
  args: { memberState: 'refreshing' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Add DM' }));
    const search = await body.findByRole('searchbox', {
      name: 'Search members',
    });
    await waitFor(() => expect(search).toHaveFocus());

    await userEvent.type(search, 'anna');
    await expect(body.getByRole('option', { name: /Anna/ })).toBeDisabled();
    await userEvent.keyboard('{Enter}');
    await expect(args.onSelectMember).not.toHaveBeenCalled();
  },
};
