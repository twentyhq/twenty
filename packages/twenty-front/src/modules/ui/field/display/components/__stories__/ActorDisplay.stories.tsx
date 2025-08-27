import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { ActorDisplay } from '@/ui/field/display/components/ActorDisplay';
import { CatalogDecorator } from 'twenty-ui/testing';

const meta: Meta = {
  title: 'UI/Display/ActorDisplay',
  component: ActorDisplay,
  args: {
    name: 'John Doe',
  },
  decorators: [ComponentWithRouterDecorator],
};

export default meta;

type Story = StoryObj<typeof ActorDisplay>;

export const Default: Story = {};

export const Catalog: Story = {
  decorators: [CatalogDecorator],
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'source',
          values: ['API', 'IMPORT', 'EMAIL', 'CALENDAR', 'MANUAL'],
          props: (source: string) => ({ source }),
        },
        {
          name: 'workspaceMemberId',
          values: [null, '123'],
          props: (workspaceMemberId: string) => ({ workspaceMemberId }),
        },
        {
          name: 'avatarUrl',
          values: [null, 'https://picsum.photos/id/237/16/16'],
          props: (avatarUrl: string) => ({ avatarUrl }),
        },
      ],
    },
  },
};
