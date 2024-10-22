import { Meta, StoryObj } from '@storybook/react';
import { HttpResponse, graphql } from 'msw';
import { ComponentDecorator } from 'twenty-ui';

import { EventCardCalendarEvent } from '@/activities/timeline-activities/rows/calendar/components/EventCardCalendarEvent';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof EventCardCalendarEvent> = {
  title: 'Modules/TimelineActivities/Rows/CalendarEvent/EventCardCalendarEvent',
  component: EventCardCalendarEvent,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof EventCardCalendarEvent>;

export const Default: Story = {
  args: {
    calendarEventId: '1',
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCalendarEvent', () => {
          return HttpResponse.json({
            data: {
              calendarEvent: {
                id: '1',
                title: 'Mock title',
                startsAt: '2022-01-01T00:00:00Z',
                endsAt: '2022-01-01T01:00:00Z',
              },
            },
          });
        }),
      ],
    },
  },
};

export const NotShared: Story = {
  args: {
    calendarEventId: '1',
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCalendarEvent', () => {
          return HttpResponse.json({
            errors: [
              {
                message: 'Forbidden',
                extensions: {
                  code: 'FORBIDDEN',
                },
              },
            ],
          });
        }),
      ],
    },
  },
};
