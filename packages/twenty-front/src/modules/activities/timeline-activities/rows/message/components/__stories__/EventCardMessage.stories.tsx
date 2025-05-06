import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { HttpResponse, graphql } from 'msw';

import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { EventCardMessage } from '@/activities/timeline-activities/rows/message/components/EventCardMessage';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof EventCardMessage> = {
  title: 'Modules/TimelineActivities/Rows/Message/EventCardMessage',
  component: EventCardMessage,
  decorators: [
    I18nFrontDecorator,
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
};

export default meta;
type Story = StoryObj<typeof EventCardMessage>;

export const Default: Story = {
  args: {
    messageId: '1',
    authorFullName: 'John Doe',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Mock title');
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneMessage', () => {
          return HttpResponse.json({
            data: {
              message: {
                id: '1',
                subject: 'Mock title',
                text: 'Mock body',
                messageParticipants: [],
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
    messageId: '1',
    authorFullName: 'John Doe',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Not shared by John Doe');
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneMessage', () => {
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
