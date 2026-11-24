import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewFilterOperand, ViewPresetFilter } from 'twenty-shared/types';

import { buildMissingAgentChatChannelViewsToCreate } from 'src/engine/metadata-modules/agent-chat-channel/utils/build-missing-agent-chat-channel-views-to-create.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

const CHANNEL_WITH_OPEN_VIEW_ID = '20202020-0000-4000-8000-00000000000a';
const CHANNEL_WITHOUT_VIEW_ID = '20202020-0000-4000-8000-00000000000b';

const buildFlatViewMaps = (
  views: Pick<FlatView, 'universalIdentifier' | 'presetFilter'>[],
): FlatEntityMaps<FlatView> =>
  views.reduce(
    (flatEntityMaps, view) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: { ...view, id: view.universalIdentifier } as FlatView,
        flatEntityMaps,
      }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatView>,
  );

const buildFlatViewFilterMaps = (
  viewFilters: Pick<
    FlatViewFilter,
    'viewUniversalIdentifier' | 'value' | 'viewFilterGroupId'
  >[],
): FlatEntityMaps<FlatViewFilter> =>
  viewFilters.reduce(
    (flatEntityMaps, viewFilter, index) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: {
          ...viewFilter,
          id: `view-filter-${index}`,
          universalIdentifier: `view-filter-${index}`,
          operand: ViewFilterOperand.IS,
          fieldMetadataUniversalIdentifier:
            STANDARD_OBJECTS.agentChatThread.fields.channelId
              .universalIdentifier,
        } as FlatViewFilter,
        flatEntityMaps,
      }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatViewFilter>,
  );

describe('buildMissingAgentChatChannelViewsToCreate', () => {
  it('should create only the views a channel does not have yet', () => {
    const { viewsToCreate, viewFiltersToCreate } =
      buildMissingAgentChatChannelViewsToCreate({
        channelIds: [CHANNEL_WITH_OPEN_VIEW_ID, CHANNEL_WITHOUT_VIEW_ID],
        flatViewMaps: buildFlatViewMaps([
          {
            universalIdentifier: 'open-view',
            presetFilter: ViewPresetFilter.INBOX_CHANNEL_OPEN,
          },
          {
            universalIdentifier: 'view-filtering-the-channel-in-a-group',
            presetFilter: ViewPresetFilter.INBOX_CHANNEL_DONE,
          },
          {
            universalIdentifier: 'view-filtering-two-channels',
            presetFilter: ViewPresetFilter.INBOX_CHANNEL_SNOOZED,
          },
        ]),
        flatViewFilterMaps: buildFlatViewFilterMaps([
          {
            viewUniversalIdentifier: 'open-view',
            value: JSON.stringify([CHANNEL_WITH_OPEN_VIEW_ID]),
            viewFilterGroupId: null,
          },
          {
            viewUniversalIdentifier: 'view-filtering-the-channel-in-a-group',
            value: JSON.stringify([CHANNEL_WITH_OPEN_VIEW_ID]),
            viewFilterGroupId: 'view-filter-group',
          },
          {
            viewUniversalIdentifier: 'view-filtering-two-channels',
            value: JSON.stringify([
              CHANNEL_WITH_OPEN_VIEW_ID,
              CHANNEL_WITHOUT_VIEW_ID,
            ]),
            viewFilterGroupId: null,
          },
        ]),
        applicationUniversalIdentifier: 'workspace-custom-application',
        now: '2026-11-24T00:00:00.000Z',
      });

    expect(
      viewsToCreate.map(({ universalIdentifier, presetFilter }) => ({
        presetFilter,
        channelFilterValue: viewFiltersToCreate.find(
          ({ viewUniversalIdentifier }) =>
            viewUniversalIdentifier === universalIdentifier,
        )?.value,
      })),
    ).toEqual([
      {
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_SNOOZED,
        channelFilterValue: JSON.stringify([CHANNEL_WITH_OPEN_VIEW_ID]),
      },
      {
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_DONE,
        channelFilterValue: JSON.stringify([CHANNEL_WITH_OPEN_VIEW_ID]),
      },
      {
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_OPEN,
        channelFilterValue: JSON.stringify([CHANNEL_WITHOUT_VIEW_ID]),
      },
      {
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_SNOOZED,
        channelFilterValue: JSON.stringify([CHANNEL_WITHOUT_VIEW_ID]),
      },
      {
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_DONE,
        channelFilterValue: JSON.stringify([CHANNEL_WITHOUT_VIEW_ID]),
      },
    ]);
  });
});
