import { EventRowMainObjectUpdated } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObjectUpdated';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const meta: Meta<typeof EventRowMainObjectUpdated> = {
  title: 'Modules/TimelineActivities/Rows/MainObject/EventRowMainObjectUpdated',
  component: EventRowMainObjectUpdated,
  args: {
    authorFullName: 'John Doe',
    labelIdentifierValue: 'Mock',
    event: {
      id: '1',
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
    },
    mainObjectMetadataItem: getTestEnrichedObjectMetadataItemsMock().find(
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
