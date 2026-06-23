import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';

import { SettingsObjectNewTimelineRule } from '~/pages/settings/data-model/SettingsObjectNewTimelineRule';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/DataModel/SettingsObjectNewTimelineRule',
  component: SettingsObjectNewTimelineRule,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectNamePlural/timeline/new-rule',
    routeParams: { ':objectNamePlural': 'companies' },
  },
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

export type Story = StoryObj<typeof SettingsObjectNewTimelineRule>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Inherits from')).toBeInTheDocument();
    expect(await canvas.findByText('Activities')).toBeInTheDocument();
    expect(await canvas.findByText('Notes')).toBeInTheDocument();
    expect(await canvas.findByText('Tasks')).toBeInTheDocument();
  },
};
