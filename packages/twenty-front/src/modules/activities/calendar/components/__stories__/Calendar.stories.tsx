import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { getOperationName } from '~/utils/getOperationName';

import { CalendarEventsCard } from '@/activities/calendar/components/CalendarEventsCard';
import { getTimelineCalendarEventsFromObjectRecord } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromObjectRecord';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedTimelineCalendarEvents } from '~/testing/mock-data/timeline-calendar-events';

const meta: Meta<typeof CalendarEventsCard> = {
  title: 'Modules/Activities/Calendar/CalendarEventsCard',
  component: CalendarEventsCard,
  decorators: [
    MemoryRouterDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    (Story) => (
      <LayoutRenderingProvider
        value={{
          targetRecordIdentifier: {
            id: '1',
            targetObjectNameSingular: CoreObjectNameSingular.Company,
          },
          layoutType: PageLayoutType.RECORD_PAGE,
        }}
      >
        <Story />
      </LayoutRenderingProvider>
    ),
  ],
  parameters: {
    container: { width: 728 },
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query(
          getOperationName(getTimelineCalendarEventsFromObjectRecord) ?? '',
          ({ variables }) => {
            if (variables.page > 1) {
              return HttpResponse.json({
                data: {
                  getTimelineCalendarEventsFromObjectRecord: {
                    __typename: 'TimelineCalendarEventsWithTotal',
                    totalNumberOfCalendarEvents: 3,
                    timelineCalendarEvents: [],
                  },
                },
              });
            }
            return HttpResponse.json({
              data: {
                getTimelineCalendarEventsFromObjectRecord: {
                  __typename: 'TimelineCalendarEventsWithTotal',
                  totalNumberOfCalendarEvents: 3,
                  timelineCalendarEvents: mockedTimelineCalendarEvents,
                },
              },
            });
          },
        ),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarEventsCard>;

export const Default: Story = {};
