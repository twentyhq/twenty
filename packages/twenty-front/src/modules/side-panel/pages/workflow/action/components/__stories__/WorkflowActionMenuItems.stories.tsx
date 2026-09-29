import { WorkflowActionMenuItems } from '@/side-panel/pages/workflow/action/components/WorkflowActionMenuItems';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta = {
  title: 'Modules/Workflow/Actions/MenuItems',
  component: WorkflowActionMenuItems,
  decorators: [ComponentDecorator],
  args: {
    actions: [
      {
        type: 'CLASSIFY',
        defaultLabel: 'Classify (Jev)',
        icon: 'IconCategory',
      },
    ],
    onClick: fn(),
  },
} satisfies Meta<typeof WorkflowActionMenuItems>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      await within(canvasElement).findByText('Classify (Jev)'),
    );
    await expect(args.onClick).toHaveBeenCalledWith('CLASSIFY');
  },
};

export const Unavailable: Story = {
  args: {
    actions: [
      {
        type: 'CLASSIFY',
        defaultLabel: 'Classify (Jev)',
        icon: 'IconCategory',
        disabled: true,
        contextualText: 'TypeSafe AI API key missing',
      },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/TypeSafe AI API key missing/),
    ).toBeVisible();
    await userEvent.click(await canvas.findByText('Classify (Jev)'));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
