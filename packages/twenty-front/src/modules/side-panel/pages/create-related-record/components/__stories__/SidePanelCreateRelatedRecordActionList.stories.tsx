import { type RelatedRecordActionBinding } from '@/activities/types/RelatedRecordAction';
import { SidePanelCreateRelatedRecordActionList } from '@/side-panel/pages/create-related-record/components/SidePanelCreateRelatedRecordPage';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconCalendarEvent, IconCheckbox, IconNotes } from 'twenty-ui/icon';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const createTask = fn();
const createCalendarEvent = fn();

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
      execute: createCalendarEvent,
    },
  },
];

const meta: Meta<typeof SidePanelCreateRelatedRecordActionList> = {
  title:
    'Modules/SidePanel/CreateRelatedRecord/SidePanelCreateRelatedRecordActionList',
  component: SidePanelCreateRelatedRecordActionList,
  args: { actionBindings },
  decorators: [MemoryRouterDecorator],
};

export default meta;
type Story = StoryObj<typeof SidePanelCreateRelatedRecordActionList>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText('Create note')).not.toBeInTheDocument();
    expect(canvas.getByText('Create calendar event')).toBeVisible();
    expect(canvas.getByText(/Add an email to this record first/)).toBeVisible();

    await userEvent.click(canvas.getByText('Create calendar event'));

    expect(createCalendarEvent).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByText('Create task'));

    expect(createTask).toHaveBeenCalledTimes(1);
  },
};
