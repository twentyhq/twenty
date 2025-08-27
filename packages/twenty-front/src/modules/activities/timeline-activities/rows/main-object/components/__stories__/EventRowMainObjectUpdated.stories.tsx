import { EventRowMainObjectUpdated } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObjectUpdated';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const meta: Meta<typeof EventRowMainObjectUpdated> = {
  title: 'Modules/TimelineActivities/Rows/MainObject/EventRowMainObjectUpdated',
  component: EventRowMainObjectUpdated,
  args: {
    authorFullName: 'John Doe',
    labelIdentifierValue: 'Mock',
    event: {
      id: '1',
      name: 'mock.updated',
      properties: {
        diff: {
          jobTitle: {
            after: 'mock job title',
            before: '',
          },
          linkedinLink: {
            after: {
              url: 'mock.linkedin',
              label: 'mock linkedin url',
            },
            before: {
              url: '',
              label: '',
            },
          },
        },
      },
    } as TimelineActivity,
    mainObjectMetadataItem: generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    ),
  },
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RouterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof EventRowMainObjectUpdated>;

export const Default: Story = {};
