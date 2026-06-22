import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';

import { SettingsTimeline } from '~/pages/settings/timeline/SettingsTimeline';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Timeline/SettingsTimeline',
  component: SettingsTimeline,
  decorators: [PageDecorator],
  args: { routePath: '/settings/timeline' },
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('GetTimelineProjectionRules', () =>
          HttpResponse.json({ data: { getTimelineProjectionRules: [] } }),
        ),
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsTimeline>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Projection rules')).toBeInTheDocument();
    expect(await canvas.findByText('Add rule')).toBeInTheDocument();
  },
};
