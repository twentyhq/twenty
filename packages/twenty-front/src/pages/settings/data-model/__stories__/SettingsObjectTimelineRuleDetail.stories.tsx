import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';

import { SettingsObjectTimelineRuleDetail } from '~/pages/settings/data-model/SettingsObjectTimelineRuleDetail';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const metadata = getTestEnrichedObjectMetadataItemsMock();

const objectMetadataId = (nameSingular: string) =>
  metadata.find((item) => item.nameSingular === nameSingular)?.id ?? '';

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
                  anchorObjectMetadataId: objectMetadataId('company'),
                  sourceObjectMetadataId: objectMetadataId('person'),
                  linkedObjectMetadataIds: [
                    objectMetadataId('note'),
                    objectMetadataId('task'),
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
