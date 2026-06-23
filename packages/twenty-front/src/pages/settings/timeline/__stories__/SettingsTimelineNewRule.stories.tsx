import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';

import { SettingsTimelineNewRule } from '~/pages/settings/timeline/SettingsTimelineNewRule';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Timeline/SettingsTimelineNewRule',
  component: SettingsTimelineNewRule,
  decorators: [PageDecorator],
  args: { routePath: '/settings/timeline/new-rule' },
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

export type Story = StoryObj<typeof SettingsTimelineNewRule>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Timeline of')).toBeInTheDocument();
    expect(await canvas.findByText('Inherits from')).toBeInTheDocument();
    expect(await canvas.findByText('Notes')).toBeInTheDocument();
    expect(await canvas.findByText('Tasks')).toBeInTheDocument();

    // Save stays disabled until an anchor and a source are picked.
    const saveButton = await canvas.findByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  },
};
