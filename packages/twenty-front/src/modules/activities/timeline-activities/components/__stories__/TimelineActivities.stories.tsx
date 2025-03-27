import { Meta, StoryObj } from '@storybook/react';
import { HttpResponse, graphql } from 'msw';

import { TimelineActivities } from '@/activities/timeline-activities/components/TimelineActivities';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { mockedTimelineActivities } from '~/testing/mock-data/timeline-activities';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof TimelineActivities> = {
  title: 'Modules/TimelineActivities/TimelineActivities',
  component: TimelineActivities,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    (Story) => {
      return (
        <TimelineActivityContext.Provider value={{ recordId: 'mock-id' }}>
          <Story />
        </TimelineActivityContext.Provider>
      );
    },
  ],
  args: {
    targetableObject: {
      id: '1',
      targetObjectNameSingular: 'company',
    },
  },
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
type Story = StoryObj<typeof TimelineActivities>;

export const Default: Story = {};
