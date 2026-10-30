import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { DirectMessagePresentationExample } from '@/ai/components/__stories__/DirectMessagePresentationExample';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const meta = {
  title: 'Modules/AI/NavigationDrawerDirectMessagesSection',
  component: DirectMessagePresentationExample,
  decorators: [ComponentWithRouterDecorator],
  parameters: { container: { width: 420 } },
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
    const sectionToggle = canvas.getByRole('button', { name: 'DMs' });

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

    sectionToggle.focus();
    await userEvent.keyboard(' ');
    await expect(sectionToggle).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Anna' }),
      ).not.toBeInTheDocument(),
    );
    await expect(canvas.getByRole('button', { name: 'General' })).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Research notes' }),
    ).toBeVisible();

    await userEvent.keyboard('{Enter}');
    await expect(sectionToggle).toHaveAttribute('aria-expanded', 'true');
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

    await userEvent.click(trigger);
    const search = await body.findByRole('searchbox', {
      name: 'Search members',
    });
    await waitFor(() => expect(search).toHaveFocus());
    await expect(
      body.queryByRole('option', { name: /Raphael/ }),
    ).not.toBeInTheDocument();

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

export const LoadingAndEmptyResults: Story = {
  args: { showDataControls: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Add DM' });

    await userEvent.click(trigger);
    const search = await body.findByRole('searchbox', {
      name: 'Search members',
    });
    await waitFor(() => expect(search).toHaveFocus());
    await expect(body.getByRole('status')).toHaveTextContent('Loading members');
    await expect(body.queryByRole('option')).not.toBeInTheDocument();
    await userEvent.type(search, 'Anna');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onSelectMember).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Add DM' }),
      ).not.toBeInTheDocument(),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show empty result' }),
    );
    await userEvent.click(trigger);
    const emptySearch = await body.findByRole('searchbox', {
      name: 'Search members',
    });
    await waitFor(() => expect(emptySearch).toHaveFocus());
    await expect(body.getByRole('status')).toHaveTextContent(
      'No members found',
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onSelectMember).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Add DM' }),
      ).not.toBeInTheDocument(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Show members' }));
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('option', { name: /Anna/ }));
    await expect(args.onSelectMember).toHaveBeenCalledTimes(1);
    await expect(args.onSelectMember).toHaveBeenCalledWith('anna');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Add DM' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
