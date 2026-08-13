import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';

import { CalendarEventsCard } from '@/activities/calendar/components/CalendarEventsCard';
import { getTimelineCalendarEventsFromObjectRecord } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromObjectRecord';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedTimelineCalendarEvents } from '~/testing/mock-data/timeline-calendar-events';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { within } from 'storybook/test';

const CALENDAR_STORY_PAGE_LAYOUT_INSTANCE_ID = 'calendar-story-page-layout';
const CALENDAR_STORY_WIDGET_INSTANCE_ID = 'calendar-story-widget';

const meta: Meta<typeof CalendarEventsCard> = {
  title: 'Modules/Activities/Calendar/CalendarEventsCard',
  component: CalendarEventsCard,
  decorators: [
    MemoryRouterDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    (Story) => (
      <PageLayoutComponentInstanceContext.Provider
        value={{ instanceId: CALENDAR_STORY_PAGE_LAYOUT_INSTANCE_ID }}
      >
        <WidgetComponentInstanceContext.Provider
          value={{ instanceId: CALENDAR_STORY_WIDGET_INSTANCE_ID }}
        >
          <LayoutRenderingProvider
            value={{
              targetRecordIdentifier: {
                id: '1',
                targetObjectNameSingular: CoreObjectNameSingular.Company,
              },
              layoutType: PageLayoutType.RECORD_PAGE,
              isInSidePanel: false,
            }}
          >
            <WidgetCardHeader
              widgetId={CALENDAR_STORY_WIDGET_INSTANCE_ID}
              variant="record-page"
              isInEditMode={false}
              title="Calendar"
            />
            <Story />
          </LayoutRenderingProvider>
        </WidgetComponentInstanceContext.Provider>
      </PageLayoutComponentInstanceContext.Provider>
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
                    relatedPersonIds: [],
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
                  relatedPersonIds: [],
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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('3');
  },
};
