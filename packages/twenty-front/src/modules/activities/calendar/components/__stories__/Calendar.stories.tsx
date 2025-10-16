import { getOperationName } from '@apollo/client/utilities';
import { type Meta, type StoryObj } from '@storybook/react';
import { HttpResponse, graphql } from 'msw';

import { CalendarEventsCard } from '@/activities/calendar/components/CalendarEventsCard';
import { getTimelineCalendarEventsFromCompanyId } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromCompanyId';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedTimelineCalendarEvents } from '~/testing/mock-data/timeline-calendar-events';

const meta: Meta<typeof CalendarEventsCard> = {
  title: 'Modules/Activities/Calendar/CalendarEventsCard',
  component: CalendarEventsCard,
  decorators: [
    I18nFrontDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    (Story) => (
      <LayoutRenderingProvider
        value={{
          targetRecordIdentifier: {
            id: '1',
            targetObjectNameSingular: CoreObjectNameSingular.Company,
          },
          layoutType: PageLayoutType.RECORD_PAGE,
          isInRightDrawer: false,
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
          getOperationName(getTimelineCalendarEventsFromCompanyId) ?? '',
          ({ variables }) => {
            if (variables.page > 1) {
              return HttpResponse.json({
                data: {
                  getTimelineCalendarEventsFromCompanyId: {
                    __typename: 'TimelineCalendarEventsWithTotal',
                    totalNumberOfCalendarEvents: 3,
                    timelineCalendarEvents: [],
                  },
                },
              });
            }
            return HttpResponse.json({
              data: {
                getTimelineCalendarEventsFromCompanyId: {
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
