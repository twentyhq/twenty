import { type Meta, type StoryObj } from '@storybook/react';
import { HttpResponse, graphql } from 'msw';

import { TimelineCard } from '@/activities/timeline-activities/components/TimelineCard';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated/graphql';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { mockedTimelineActivities } from '~/testing/mock-data/timeline-activities';

const meta: Meta<typeof TimelineCard> = {
  title: 'Modules/TimelineActivities/TimelineCard',
  component: TimelineCard,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    (Story) => {
      return (
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
          <TimelineActivityContext.Provider value={{ recordId: 'mock-id' }}>
            <Story />
          </TimelineActivityContext.Provider>
        </LayoutRenderingProvider>
      );
    },
  ],
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManyActivities', () => {
          return HttpResponse.json({
            data: {
              activities: {
                edges: [],
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor: null,
                  endCursor: null,
                },
              },
            },
          });
        }),
        graphql.query('FindManyTimelineActivities', () => {
          return HttpResponse.json({
            data: {
              timelineActivities: {
                edges: mockedTimelineActivities.map((activity) => ({
                  node: activity,
                  cursor: activity.id,
                })),
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor: null,
                  endCursor: null,
                },
              },
            },
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TimelineCard>;

export const Default: Story = {};
