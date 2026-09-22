import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { buildTranscriptPageLayoutTabUpdates } from 'src/database/commands/upgrade-version-command/2-42/utils/build-transcript-page-layout-tab-updates.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-09-21T12:00:00.000Z';
const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-20T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const buildUpdates = (
  tabs: FlatPageLayoutTab[],
  direction: 'up' | 'down' = 'up',
) =>
  buildTranscriptPageLayoutTabUpdates({
    flatPageLayoutTabsByUniversalIdentifier: Object.fromEntries(
      tabs.map((tab) => [tab.universalIdentifier, tab]),
    ),
    now: NOW,
    direction,
  });

describe.each([
  [
    'calendarEvent',
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage,
  ],
  [
    'callRecording',
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage,
  ],
])('buildTranscriptPageLayoutTabUpdates for %s', (_objectName, layout) => {
  const tab =
    allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
      layout.tabs.callRecording.universalIdentifier
    ];

  if (!isDefined(tab)) {
    throw new Error('Standard transcript tab is missing');
  }

  const legacyTab = { ...tab, title: 'Call Recording', icon: 'IconVideo' };

  it('renames defaults while preserving identity, layout and overrides', () => {
    const overrides = {
      workspace: { title: 'Interview', icon: 'IconPhone', position: 12 },
    };

    expect(buildUpdates([{ ...legacyTab, overrides }])).toEqual([
      {
        ...legacyTab,
        overrides,
        title: 'Transcript',
        icon: 'IconBlockquote',
        updatedAt: NOW,
      },
    ]);
  });

  it('preserves custom base titles and icons independently', () => {
    expect(
      buildUpdates([{ ...legacyTab, title: 'Interview', icon: 'IconPhone' }]),
    ).toEqual([]);
    expect(
      buildUpdates([{ ...legacyTab, title: 'Interview' }])[0],
    ).toMatchObject({ title: 'Interview', icon: 'IconBlockquote' });
    expect(buildUpdates([{ ...legacyTab, icon: null }])[0]).toMatchObject({
      title: 'Transcript',
      icon: null,
    });
  });

  it('does nothing after the first run or when the tab is missing', () => {
    expect(buildUpdates(buildUpdates([legacyTab]))).toEqual([]);
    expect(buildUpdates([])).toEqual([]);
    expect(buildUpdates([tab])).toEqual([]);
  });

  it('skips deleted tabs, other applications and unrelated tabs', () => {
    expect(buildUpdates([{ ...legacyTab, deletedAt: NOW }])).toEqual([]);
    expect(
      buildUpdates([
        { ...legacyTab, applicationUniversalIdentifier: 'another-application' },
      ]),
    ).toEqual([]);
    expect(
      buildUpdates([
        {
          ...legacyTab,
          universalIdentifier: layout.tabs.summary.universalIdentifier,
        },
      ]),
    ).toEqual([]);
  });

  it('restores previous defaults on down and is idempotent', () => {
    const overrides = { workspace: { title: 'Interview' } };
    const updates = buildUpdates([{ ...tab, overrides }], 'down');

    expect(updates).toEqual([{ ...legacyTab, overrides, updatedAt: NOW }]);
    expect(buildUpdates(updates, 'down')).toEqual([]);
  });
});
