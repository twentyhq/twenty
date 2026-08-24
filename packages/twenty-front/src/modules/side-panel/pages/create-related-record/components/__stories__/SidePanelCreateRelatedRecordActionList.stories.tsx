import { type RelatedRecordActionBinding } from '@/activities/types/RelatedRecordAction';
import { SidePanelCreateRelatedRecordActionList } from '@/side-panel/pages/create-related-record/components/SidePanelCreateRelatedRecordPage';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconCalendarEvent, IconCheckbox, IconNotes } from 'twenty-ui/icon';

const createTask = fn();

const actionBindings: RelatedRecordActionBinding[] = [
  {
    action: {
      id: 'create-task',
      label: 'Create task',
      Icon: IconCheckbox,
      isVisible: true,
      disabled: false,
      execute: createTask,
    },
  },
  {
    action: {
      id: 'create-note',
      label: 'Create note',
      Icon: IconNotes,
      isVisible: false,
      disabled: false,
      execute: fn(),
    },
  },
  {
    action: {
      id: 'create-calendar-event',
      label: 'Create calendar event',
      Icon: IconCalendarEvent,
      isVisible: true,
      disabled: true,
      disabledReason: 'Add an email to this record first',
      execute: fn(),
    },
  },
];

const meta: Meta<typeof SidePanelCreateRelatedRecordActionList> = {
  title:
    'Modules/SidePanel/CreateRelatedRecord/SidePanelCreateRelatedRecordActionList',
  component: SidePanelCreateRelatedRecordActionList,
  args: { actionBindings },
};

export default meta;
type Story = StoryObj<typeof SidePanelCreateRelatedRecordActionList>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText('Create note')).not.toBeInTheDocument();
    expect(
      canvas.getByRole('button', { name: /Create calendar event/ }),
    ).toBeDisabled();

    await userEvent.click(canvas.getByRole('button', { name: 'Create task' }));

    expect(createTask).toHaveBeenCalledTimes(1);
  },
};
