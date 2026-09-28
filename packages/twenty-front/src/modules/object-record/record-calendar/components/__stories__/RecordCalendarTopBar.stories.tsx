import { RecordCalendarTopBar } from '@/object-record/record-calendar/components/RecordCalendarTopBar';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Temporal } from 'temporal-polyfill';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

const CALENDAR_ID = 'calendar-top-bar-story';
const SECOND_CALENDAR_ID = 'second-calendar-top-bar-story';

const CalendarTopBarStory = ({
  instanceId = CALENDAR_ID,
  isWidget = false,
}: {
  instanceId?: string;
  isWidget?: boolean;
}) => (
  <RecordCalendarComponentInstanceContext.Provider value={{ instanceId }}>
    <ViewComponentInstanceContext.Provider value={{ instanceId }}>
      <WidgetComponentInstanceContext.Provider
        value={isWidget ? { instanceId } : null}
      >
        <RecordCalendarTopBar />
      </WidgetComponentInstanceContext.Provider>
    </ViewComponentInstanceContext.Provider>
  </RecordCalendarComponentInstanceContext.Provider>
);

const meta: Meta<typeof CalendarTopBarStory> = {
  title: 'Modules/ObjectRecord/RecordCalendar/TopBar',
  component: CalendarTopBarStory,
  render: (args) => <CalendarTopBarStory {...args} />,
  decorators: [
    ComponentDecorator,
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    MemoryRouterDecorator,
  ],
  beforeEach: () => {
    for (const instanceId of [CALENDAR_ID, SECOND_CALENDAR_ID]) {
      jotaiStore.set(
        recordCalendarSelectedDateComponentState.atomFamily({ instanceId }),
        Temporal.PlainDate.from('2026-01-15'),
      );
    }
  },
};

export default meta;
type Story = StoryObj<typeof CalendarTopBarStory>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole(
        'button',
        { name: 'January 2026' },
        { timeout: 10000 },
      ),
    ).toBeVisible();
  },
};

export const ChangingMonthClosesTheDatePanel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'January 2026' },
        { timeout: 10000 },
      ),
    );
    const panel = await body.findByRole('dialog', { name: 'Select date' });
    await userEvent.click(
      await within(panel).findByRole('button', { name: 'January' }),
    );
    await userEvent.click(
      await body.findByRole('button', { name: 'February' }),
    );

    await waitFor(() => {
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(
      canvas.getByRole('button', { name: 'February 2026' }),
    ).toBeVisible();
  },
};

export const DismissesOnePanelAtATime: Story = {
  render: () => (
    <>
      <CalendarTopBarStory />
      <Button>Outside calendar</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    for (const dismissal of ['escape', 'outside']) {
      await userEvent.click(
        await canvas.findByRole(
          'button',
          { name: 'January 2026' },
          { timeout: 10000 },
        ),
      );
      const panel = await body.findByRole('dialog', { name: 'Select date' });
      await userEvent.click(
        await within(panel).findByRole('button', { name: 'January' }),
      );
      await body.findByRole('button', { name: 'February' });

      if (dismissal === 'escape') {
        await userEvent.keyboard('{Escape}');
      }
      if (dismissal === 'outside') {
        await userEvent.click(
          canvas.getByRole('button', { name: 'Outside calendar' }),
        );
      }

      await waitFor(() => {
        expect(
          body.queryByRole('button', { name: 'February' }),
        ).not.toBeInTheDocument();
      });
      await expect(panel).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await waitFor(() => {
        expect(
          body.queryByRole('dialog', { name: 'Select date' }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const WidgetCalendarsKeepIndependentDates: Story = {
  render: () => (
    <>
      <CalendarTopBarStory isWidget />
      <CalendarTopBarStory instanceId={SECOND_CALENDAR_ID} isWidget />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [trigger] = await canvas.findAllByRole(
      'button',
      { name: 'January 2026' },
      { timeout: 10000 },
    );

    assertIsDefinedOrThrow(trigger);

    await userEvent.click(trigger);
    const panel = await body.findByRole('dialog', { name: 'Select date' });
    await userEvent.click(
      await within(panel).findByRole('button', { name: '2026' }),
    );
    await userEvent.click(await body.findByRole('button', { name: '2027' }));
    await waitFor(() => {
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', { name: 'January 2027' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'January 2026' }));
    const secondPanel = await body.findByRole('dialog', {
      name: 'Select date',
    });
    await expect(
      await within(secondPanel).findByRole('button', { name: '2026' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Month' }),
    ).not.toBeInTheDocument();
  },
};
