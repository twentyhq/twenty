import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadReasonBadge } from '@/ai/components/AiChatThreadReasonBadge';
import { AiChatThreadRequestActions } from '@/ai/components/AiChatThreadRequestActions';
import { AiChatThreadRow } from '@/ai/components/AiChatThreadRow';
import { AiChatThreadTriageButtons } from '@/ai/components/AiChatThreadTriageButtons';

const StyledSubtitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const onDone = fn();
const onSnooze = fn();
const onReopen = fn();
const onReview = fn();

const meta = {
  title: 'Modules/AI/AiChatThreadRow',
  component: AiChatThreadRow,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 760 } },
  args: {
    id: 'renewal-outreach',
    label: 'Q3 renewal outreach',
    avatar: <Avatar name="Sarah Lin" size="lg" shape="circle" />,
    title: (
      <Text size="md" weight="medium" truncate>
        Q3 renewal outreach
      </Text>
    ),
    subtitle: (
      <Text size="sm" color="tertiary" truncate>
        Sarah: I drafted five check-in emails for the October renewals.
      </Text>
    ),
    activityTime: (
      <Text size="sm" color="tertiary">
        09:48
      </Text>
    ),
    actions: (
      <AiChatThreadTriageButtons
        status="open"
        onDone={onDone}
        onSnooze={onSnooze}
        onReopen={onReopen}
      />
    ),
    onClick: fn(),
    onCheckboxClick: fn(),
    onContextMenu: fn(),
  },
} satisfies Meta<typeof AiChatThreadRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvasElement, args }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Q3 renewal outreach' });

    await user.hover(row);
    await user.click(canvas.getByRole('button', { name: 'Snooze' }));
    await expect(onSnooze).toHaveBeenCalledTimes(1);
    await user.click(canvas.getByRole('button', { name: 'Done' }));
    await expect(onDone).toHaveBeenCalledTimes(1);
    await expect(args.onClick).not.toHaveBeenCalled();
    await user.keyboard('{Shift>}');
    await user.click(canvas.getByRole('checkbox', { name: 'Select chat' }));
    await user.keyboard('{/Shift}');
    await expect(args.onCheckboxClick).toHaveBeenCalledTimes(1);
    await expect(args.onCheckboxClick).toHaveBeenCalledWith(
      expect.objectContaining({ shiftKey: true }),
    );
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Q3 renewal outreach' });

    await userEvent.tab();
    await expect(row).toHaveFocus();
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Done' })).toBeVisible(),
    );
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await expect(
      canvas.getByRole('checkbox', { name: 'Select chat' }),
    ).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onCheckboxClick).toHaveBeenCalledTimes(1);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Editing: Story = {
  args: {
    isEditing: true,
    activityTime: undefined,
    title: (
      <Input aria-label="Rename chat" defaultValue="Q3 renewal outreach" />
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Q3 renewal outreach' });
    const input = canvas.getByRole('textbox', { name: 'Rename chat' });

    await userEvent.click(row);
    await expect(row).toHaveFocus();
    await userEvent.keyboard('{Enter} ');
    await userEvent.pointer({ target: row, keys: '[MouseRight]' });
    await userEvent.type(input, ' updated');
    await expect(input).toHaveValue('Q3 renewal outreach updated');
    await userEvent.keyboard('{Enter} ');
    await userEvent.pointer({ target: input, keys: '[MouseRight]' });
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(args.onContextMenu).not.toHaveBeenCalled();
  },
};

export const ActionMenuOpen: Story = {
  args: { isActionMenuOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Q3 renewal outreach' });

    await userEvent.hover(row);
    await userEvent.unhover(row);
    await expect(canvas.getByRole('button', { name: 'Snooze' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Done' })).toBeVisible();
    await expect(canvas.getByText('09:48')).not.toBeVisible();
  },
};

export const WithoutOptionalControls: Story = {
  args: { actions: undefined, onCheckboxClick: undefined },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Q3 renewal outreach' });
    const activityTime = canvas.getByText('09:48');

    await userEvent.hover(row);
    await expect(activityTime).toBeVisible();
    await expect(canvas.queryByRole('checkbox')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await userEvent.unhover(row);
    await userEvent.tab();
    await expect(row).toHaveFocus();
    await expect(activityTime).toBeVisible();
    await userEvent.click(row);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const UnreadRequest: Story = {
  args: {
    title: (
      <Text size="md" weight="semibold" truncate>
        Q3 renewal outreach
      </Text>
    ),
    subtitle: (
      <StyledSubtitle>
        <AiChatThreadReasonBadge reason="needsInput" isUnread />
        <Text size="sm" color="secondary" truncate>
          Ada: Five renewal drafts are ready for your review.
        </Text>
      </StyledSubtitle>
    ),
    children: (
      <AiChatThreadRequestActions
        request={{ type: 'review', label: 'Review 5 drafts', onReview }}
      />
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Review 5 drafts' }),
    );
    await expect(onReview).toHaveBeenCalledTimes(1);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Selected: Story = { args: { isSelected: true } };
export const Checked: Story = { args: { isChecked: true } };

export const NarrowDraft: Story = {
  parameters: { container: { width: 320 } },
  args: {
    subtitle: (
      <StyledSubtitle>
        <AiChatThreadReasonBadge reason="needsInput" isUnread />
        <AiChatThreadReasonBadge reason="draft" />
        <Text size="sm" color="tertiary" truncate>
          Quote the annual plan and include the renewal details
        </Text>
      </StyledSubtitle>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Q3 renewal outreach' });
    const activityTime = canvas.getByText('09:48');
    const subtitle = canvas.getByText(
      'Quote the annual plan and include the renewal details',
    );

    await expect(row.getBoundingClientRect().height).toBe(65);
    await expect(activityTime).toBeVisible();
    await userEvent.tab();
    await expect(row).toHaveFocus();
    const doneButton = canvas.getByRole('button', { name: 'Done' });
    await waitFor(() => expect(doneButton).toBeVisible());
    await expect(activityTime).not.toBeVisible();
    await expect(row.getBoundingClientRect().height).toBe(65);
    await expect(doneButton.getBoundingClientRect().top).toBeLessThan(
      subtitle.getBoundingClientRect().bottom,
    );
    const preview = subtitle.parentElement;

    if (!isDefined(preview)) {
      throw new Error('Chat preview container is missing');
    }

    const draftBadge = canvas.getByText('Draft');
    let visibleDraftRight = draftBadge.getBoundingClientRect().right;

    for (
      let ancestor = draftBadge.parentElement;
      isDefined(ancestor);
      ancestor = ancestor.parentElement
    ) {
      if (getComputedStyle(ancestor).overflowX === 'visible') {
        continue;
      }

      visibleDraftRight = Math.min(
        visibleDraftRight,
        ancestor.getBoundingClientRect().right,
      );
    }

    await expect(visibleDraftRight).toBeLessThanOrEqual(
      preview.getBoundingClientRect().right,
    );
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
    await userEvent.tab();
    await expect(
      canvas.getByRole('checkbox', { name: 'Select chat' }),
    ).toHaveFocus();
    await userEvent.tab();
    const snoozeButton = canvas.getByRole('button', { name: 'Snooze' });
    await expect(snoozeButton).toHaveFocus();
    await waitFor(() => expect(snoozeButton).toBeVisible());
    await expect(activityTime).not.toBeVisible();
    await expect(row.getBoundingClientRect().height).toBe(65);
    await expect(snoozeButton.getBoundingClientRect().top).toBeLessThan(
      subtitle.getBoundingClientRect().bottom,
    );
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
  },
};

export const SplitDraft: Story = {
  ...NarrowDraft,
  parameters: { container: { width: 400 } },
};

export const Snoozed: Story = {
  args: {
    activityTime: (
      <Text size="sm" color="tertiary">
        Thu · 09:00
      </Text>
    ),
    actions: (
      <AiChatThreadTriageButtons
        status="snoozed"
        onDone={onDone}
        onSnooze={onSnooze}
        onReopen={onReopen}
      />
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(
      canvas.getByRole('group', { name: 'Q3 renewal outreach' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Change' }));
    await expect(onSnooze).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Wake now' }));
    await expect(onReopen).toHaveBeenCalledTimes(1);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const CompactSnoozed: Story = {
  ...Snoozed,
  tags: ['!dev'],
  parameters: { container: { width: 400 } },
  play: async ({ canvasElement }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Q3 renewal outreach' });
    const activityTime = canvas.getByText('Thu · 09:00');
    const title = canvas.getByText('Q3 renewal outreach');
    const subtitle = canvas.getByText(
      'Sarah: I drafted five check-in emails for the October renewals.',
    );
    const canHoverWithoutTouch = window.matchMedia(
      '(hover: hover) and (not (any-pointer: coarse))',
    ).matches;

    await trustedUserEvent.unhover(row);
    await expect(row.getBoundingClientRect().height).toBe(65);
    await expect(activityTime).toBeVisible();
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
    await trustedUserEvent.hover(row);
    const changeButton = canvas.getByRole('button', { name: 'Change' });
    const wakeButton = canvas.getByRole('button', { name: 'Wake now' });
    await waitFor(() => expect(changeButton).toBeVisible());
    await expect(wakeButton).toBeVisible();
    await expect(activityTime.getBoundingClientRect().width > 0).toBe(
      !canHoverWithoutTouch,
    );
    await expect(row.getBoundingClientRect().height).toBe(65);
    await expect(changeButton.getBoundingClientRect().height).toBe(24);
    await expect(wakeButton.getBoundingClientRect().height).toBe(24);
    await expect(changeButton.getBoundingClientRect().top).toBe(
      wakeButton.getBoundingClientRect().top,
    );
    await expect(
      changeButton.getBoundingClientRect().top,
    ).toBeGreaterThanOrEqual(title.getBoundingClientRect().top);
    await expect(wakeButton.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      subtitle.getBoundingClientRect().bottom,
    );
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
    await trustedUserEvent.unhover(row);
    await userEvent.tab();
    await expect(row).toHaveFocus();
    await waitFor(() => expect(changeButton).toBeVisible());
    await expect(activityTime.getBoundingClientRect().width > 0).toBe(
      !canHoverWithoutTouch,
    );
    await expect(row.getBoundingClientRect().height).toBe(65);
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
  },
};

export const Done: Story = {
  args: {
    actions: (
      <AiChatThreadTriageButtons
        status="done"
        onDone={onDone}
        onSnooze={onSnooze}
        onReopen={onReopen}
      />
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(
      canvas.getByRole('group', { name: 'Q3 renewal outreach' }),
    );
    await expect(
      canvas.queryByRole('button', { name: 'Done' }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reopen' }));
    await expect(onReopen).toHaveBeenCalledTimes(1);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
