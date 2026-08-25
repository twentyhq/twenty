import { WidgetActionRelatedRecord } from '@/page-layout/widgets/components/WidgetActionRelatedRecord';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconCheckbox } from 'twenty-ui/icon';

const execute = fn();

const meta: Meta<typeof WidgetActionRelatedRecord> = {
  title: 'Modules/PageLayout/Widgets/WidgetActionRelatedRecord',
  component: WidgetActionRelatedRecord,
  args: {
    binding: {
      action: {
        id: 'create-task',
        label: 'Create task',
        Icon: IconCheckbox,
        isVisible: true,
        disabled: false,
        execute,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WidgetActionRelatedRecord>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Create task' }));

    expect(execute).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  args: {
    binding: {
      action: {
        id: 'create-calendar-event',
        label: 'Create calendar event',
        Icon: IconCheckbox,
        isVisible: true,
        disabled: true,
        disabledReason: 'Add an email to this record first',
        execute: fn(),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.getByRole('button', {
        name: 'Add an email to this record first',
      }),
    ).toBeDisabled();
  },
};

export const Hidden: Story = {
  args: {
    binding: {
      action: {
        id: 'create-task',
        label: 'Create task',
        Icon: IconCheckbox,
        isVisible: false,
        disabled: false,
        execute: fn(),
      },
    },
  },
};
