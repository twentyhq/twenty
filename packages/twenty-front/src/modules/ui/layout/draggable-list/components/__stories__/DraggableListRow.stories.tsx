import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconBell, IconEyeOff } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const onVisibilityChange = fn();

const meta: Meta<typeof DraggableListRow> = {
  title: 'UI/Layout/DraggableList/DraggableListRow',
  component: DraggableListRow,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 320 } },
  args: {
    children: 'Company name',
    startIcon: <IconBell />,
    dragHandleVisibility: 'always',
    actionsVisibility: 'always',
    actions: (
      <LightIconButton aria-label="Hide field" onClick={onVisibilityChange}>
        <IconEyeOff />
      </LightIconButton>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof DraggableListRow>;

export const PresentationalRow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', { name: 'Hide field' });

    onVisibilityChange.mockClear();
    await expect(canvas.getAllByRole('button')).toHaveLength(1);
    await userEvent.tab();
    await expect(action).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onVisibilityChange).toHaveBeenCalledTimes(1);
  },
};

export const DisabledPrimaryAction: Story = {
  args: { onAction: fn(), isActionDisabled: true, isDragDisabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const rowAction = canvas.getByRole('button', { name: 'Company name' });
    const visibilityAction = canvas.getByRole('button', { name: 'Hide field' });

    onVisibilityChange.mockClear();
    await expect(rowAction).toBeDisabled();
    await expect(visibilityAction).toBeEnabled();
    await userEvent.tab();
    await expect(visibilityAction).toHaveFocus();
    await userEvent.click(visibilityAction);
    await expect(onVisibilityChange).toHaveBeenCalledTimes(1);
    await expect(args.onAction).not.toHaveBeenCalled();
  },
};

export const OverflowingPrimaryAction: Story = {
  parameters: { container: { width: 180 } },
  args: {
    children: 'A record creation form field with a long label',
    onAction: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const rowAction = canvas.getByRole('button', {
      name: 'A record creation form field with a long label',
    });
    const visibilityAction = canvas.getByRole('button', { name: 'Hide field' });

    onVisibilityChange.mockClear();
    await expect(rowAction.scrollWidth).toBeGreaterThan(rowAction.clientWidth);
    await userEvent.hover(rowAction);
    await expect(await page.findByRole('tooltip')).toHaveTextContent(
      'A record creation form field with a long label',
    );
    await userEvent.click(rowAction);
    await expect(args.onAction).toHaveBeenCalledTimes(1);
    await expect(rowAction).toHaveFocus();
    await userEvent.unhover(rowAction);
    await expect(page.getByRole('tooltip')).toBeVisible();
    await userEvent.tab();
    await expect(visibilityAction).toHaveFocus();
    await waitFor(() =>
      expect(page.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    await userEvent.click(visibilityAction);
    await expect(onVisibilityChange).toHaveBeenCalledTimes(1);
    await expect(args.onAction).toHaveBeenCalledTimes(1);
    await userEvent.tab({ shift: true });
    await expect(rowAction).toHaveFocus();
    await expect(getComputedStyle(rowAction).outlineStyle).toBe('none');
    const focusRing = getComputedStyle(rowAction, '::after');
    await expect(focusRing.outlineStyle).toBe('solid');
    await expect(focusRing.outlineWidth).toBe('2px');
  },
};
