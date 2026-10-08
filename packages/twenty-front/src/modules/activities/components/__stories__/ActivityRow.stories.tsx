import { ActivityRow } from '@/activities/components/ActivityRow';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { Checkbox } from 'twenty-ui/primitives/input';
import {
  OverflowingTextWithTooltip,
  Text,
} from 'twenty-ui/primitives/typography';

const meta: Meta<typeof ActivityRow> = {
  title: 'Modules/Activities/ActivityRow',
  component: ActivityRow,
  args: {
    children: 'Activity',
    label: 'Open activity',
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ActivityRow>;

export const Interactive: Story = {
  play: async ({ canvasElement, args }) => {
    const action = within(canvasElement).getByRole('button', {
      name: 'Open activity',
    });

    action.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const action = within(canvasElement).getByRole('button', {
      name: 'Open activity',
    });

    await expect(action).toBeDisabled();
    action.focus();
    await expect(action).not.toHaveFocus();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const IndependentCheckbox: Story = {
  render: (args) => (
    <ActivityRow {...args}>
      <span style={{ position: 'relative', zIndex: 1 }}>
        <Checkbox aria-label="Complete activity" />
      </span>
      <Text style={{ position: 'relative', zIndex: 1 }}>
        Activity with independent completion
      </Text>
    </ActivityRow>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', { name: 'Open activity' });
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Complete activity',
    });

    await expect(action).not.toContainElement(checkbox);
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onClick).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByText('Activity with independent completion'),
    );
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    action.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const BodyTooltipAndLink: Story = {
  render: (args) => (
    <ActivityRow {...args}>
      <OverflowingTextWithTooltip
        text={
          <Text render={<span />}>
            Activity body{' '}
            <a
              href="#activity-reference"
              onClick={(event) => event.preventDefault()}
            >
              Reference
            </a>
          </Text>
        }
        tooltipContent="Activity details"
        alwaysShowTooltip
        style={{ position: 'relative', zIndex: 1 }}
      />
    </ActivityRow>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = canvas.getByText('Activity body', { exact: false });

    await userEvent.hover(body);
    await expect(
      await within(canvasElement.ownerDocument.body).findByText(
        'Activity details',
      ),
    ).toBeVisible();
    await userEvent.click(body);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('link', { name: 'Reference' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const HoverSurface: Story = {
  tags: ['!dev'],
  render: (args) => (
    <>
      <Text>Outside activity</Text>
      <ActivityRow {...args}>
        <Text style={{ position: 'relative', zIndex: 1 }}>
          Raised activity summary
        </Text>
        <span style={{ position: 'relative', zIndex: 1 }}>
          <Checkbox aria-label="Complete hovered activity" />
        </span>
        <a
          href="#hovered-activity-reference"
          onClick={(event) => event.preventDefault()}
          style={{ position: 'relative', zIndex: 1 }}
        >
          Activity reference
        </a>
      </ActivityRow>
      <ActivityRow {...args} disabled label="Unavailable activity">
        <Text style={{ position: 'relative', zIndex: 1 }}>
          Unavailable activity summary
        </Text>
      </ActivityRow>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', { name: 'Open activity' });
    const disabledAction = canvas.getByRole('button', {
      name: 'Unavailable activity',
    });
    const rowContent = action.parentElement;
    const disabledRowContent = disabledAction.parentElement;

    if (!isDefined(rowContent) || !isDefined(disabledRowContent)) {
      throw new Error('Activity content was not rendered');
    }

    await trustedUserEvent.hover(canvas.getByText('Outside activity'));

    const restingBackground = getComputedStyle(rowContent).backgroundColor;
    const disabledBackground =
      getComputedStyle(disabledRowContent).backgroundColor;
    const body = canvas.getByText('Raised activity summary');
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Complete hovered activity',
    });
    const link = canvas.getByRole('link', { name: 'Activity reference' });

    await trustedUserEvent.hover(body);
    await expect(rowContent).not.toHaveStyle({
      backgroundColor: restingBackground,
    });

    const hoveredBackground = getComputedStyle(rowContent).backgroundColor;

    for (const target of [action, checkbox, link]) {
      await trustedUserEvent.hover(target);
      await expect(rowContent).toHaveStyle({
        backgroundColor: hoveredBackground,
      });
    }

    await expect(body).toHaveStyle({ cursor: 'pointer' });
    await trustedUserEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await trustedUserEvent.click(link);
    await expect(args.onClick).not.toHaveBeenCalled();
    await trustedUserEvent.click(body);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    const disabledBody = canvas.getByText('Unavailable activity summary');

    await trustedUserEvent.hover(disabledBody);
    await expect(disabledRowContent).toHaveStyle({
      backgroundColor: disabledBackground,
    });
    await expect(disabledBody).not.toHaveStyle({ cursor: 'pointer' });
    await trustedUserEvent.click(disabledBody);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
