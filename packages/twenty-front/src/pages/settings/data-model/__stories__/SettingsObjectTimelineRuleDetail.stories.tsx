import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';

import { SettingsObjectTimelineRuleDetail } from '~/pages/settings/data-model/SettingsObjectTimelineRuleDetail';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const COMPANY_OBJECT_METADATA_ID = '4cafe09c-e246-4de8-a4f3-8c60e1186395';
const PERSON_OBJECT_METADATA_ID = '2e21f68d-8657-40a7-9050-02c5609f03a0';
const NOTE_OBJECT_METADATA_ID = '12cfa04b-8aa5-442e-8148-757f7f90f578';
const TASK_OBJECT_METADATA_ID = 'cccd1738-3b69-4297-bfd2-741438ccc9ef';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/DataModel/SettingsObjectTimelineRuleDetail',
  component: SettingsObjectTimelineRuleDetail,
  decorators: [PageDecorator],
  args: {
    routePath:
      '/settings/objects/:objectNamePlural/timeline/rules/:timelineProjectionRuleId',
    routeParams: {
      ':objectNamePlural': 'companies',
      ':timelineProjectionRuleId': 'rule-1',
    },
  },
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('GetTimelineProjectionRules', () =>
          HttpResponse.json({
            data: {
              getTimelineProjectionRules: [
                {
                  id: 'rule-1',
                  anchorObjectMetadataId: COMPANY_OBJECT_METADATA_ID,
                  sourceObjectMetadataId: PERSON_OBJECT_METADATA_ID,
                  linkedObjectMetadataIds: [
                    NOTE_OBJECT_METADATA_ID,
                    TASK_OBJECT_METADATA_ID,
                  ],
                },
              ],
            },
          }),
        ),
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectTimelineRuleDetail>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Inherits from')).toBeInTheDocument();
    expect(await canvas.findByText('Activities')).toBeInTheDocument();
    expect(await canvas.findByText('Notes')).toBeInTheDocument();
    expect(await canvas.findByText('Tasks')).toBeInTheDocument();
  },
};
