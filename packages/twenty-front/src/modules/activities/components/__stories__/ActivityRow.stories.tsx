import { ActivityRow } from '@/activities/components/ActivityRow';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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
