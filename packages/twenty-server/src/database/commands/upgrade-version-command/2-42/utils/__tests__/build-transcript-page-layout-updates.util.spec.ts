import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { WidgetType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildTranscriptPageLayoutUpdates } from 'src/database/commands/upgrade-version-command/2-42/utils/build-transcript-page-layout-updates.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
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
  widgets: FlatPageLayoutWidget[] = [],
  direction: 'up' | 'down' = 'up',
) =>
  buildTranscriptPageLayoutUpdates({
    flatPageLayoutTabsByUniversalIdentifier: Object.fromEntries(
      tabs.map((tab) => [tab.universalIdentifier, tab]),
    ),
    flatPageLayoutWidgetsByUniversalIdentifier: Object.fromEntries(
      widgets.map((widget) => [widget.universalIdentifier, widget]),
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
])('buildTranscriptPageLayoutUpdates for %s', (_objectName, layout) => {
  const tab =
    allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
      layout.tabs.callRecording.universalIdentifier
    ];
  const widget =
    allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
      layout.tabs.callRecording.widgets.transcript.universalIdentifier
    ];

  if (!isDefined(tab) || !isDefined(widget)) {
    throw new Error('Standard transcript metadata is missing');
  }

  const legacyTab = { ...tab, title: 'Call Recording', icon: 'IconVideo' };
  const legacyWidget = { ...widget, title: 'Call Recording' };

  it('renames defaults while preserving identity, layout and configuration', () => {
    expect(buildUpdates([legacyTab], [legacyWidget])).toEqual({
      pageLayoutTabsToUpdate: [
        {
          ...legacyTab,
          title: 'Transcript',
          icon: 'IconBlockquote',
          updatedAt: NOW,
        },
      ],
      pageLayoutWidgetsToUpdate: [
        { ...legacyWidget, title: 'Transcript', updatedAt: NOW },
      ],
    });
  });

  it('preserves authored title, icon and position overrides', () => {
    const tabOverrides = {
      workspace: { title: 'Interview', icon: 'IconPhone', position: 12 },
    };
    const widgetOverrides = {
      workspace: { title: 'Interview notes', position: widget.position },
    };
    const updates = buildUpdates(
      [{ ...legacyTab, overrides: tabOverrides }],
      [{ ...legacyWidget, overrides: widgetOverrides }],
    );

    expect(updates.pageLayoutTabsToUpdate[0].overrides).toEqual(tabOverrides);
    expect(updates.pageLayoutWidgetsToUpdate[0].overrides).toEqual(
      widgetOverrides,
    );
  });

  it('preserves custom base titles and icons independently', () => {
    expect(
      buildUpdates(
        [{ ...legacyTab, title: 'Interview', icon: 'IconPhone' }],
        [{ ...legacyWidget, title: 'Interview notes' }],
      ),
    ).toEqual({
      pageLayoutTabsToUpdate: [],
      pageLayoutWidgetsToUpdate: [],
    });
    expect(
      buildUpdates([{ ...legacyTab, title: 'Interview' }])
        .pageLayoutTabsToUpdate[0],
    ).toMatchObject({ title: 'Interview', icon: 'IconBlockquote' });
    expect(
      buildUpdates([{ ...legacyTab, icon: null }]).pageLayoutTabsToUpdate[0],
    ).toMatchObject({ title: 'Transcript', icon: null });
  });

  it('does nothing after the first run or when metadata is missing', () => {
    const updates = buildUpdates([legacyTab], [legacyWidget]);

    expect(
      buildUpdates(
        updates.pageLayoutTabsToUpdate,
        updates.pageLayoutWidgetsToUpdate,
      ),
    ).toEqual({ pageLayoutTabsToUpdate: [], pageLayoutWidgetsToUpdate: [] });
    expect(buildUpdates([], [])).toEqual({
      pageLayoutTabsToUpdate: [],
      pageLayoutWidgetsToUpdate: [],
    });
    expect(buildUpdates([tab], [widget])).toEqual({
      pageLayoutTabsToUpdate: [],
      pageLayoutWidgetsToUpdate: [],
    });
  });

  it('skips deleted metadata and other applications', () => {
    expect(
      buildUpdates(
        [{ ...legacyTab, deletedAt: NOW }],
        [{ ...legacyWidget, deletedAt: NOW }],
      ),
    ).toEqual({ pageLayoutTabsToUpdate: [], pageLayoutWidgetsToUpdate: [] });
    expect(
      buildUpdates(
        [
          {
            ...legacyTab,
            applicationUniversalIdentifier: 'another-application',
          },
        ],
        [
          {
            ...legacyWidget,
            applicationUniversalIdentifier: 'another-application',
          },
        ],
      ),
    ).toEqual({ pageLayoutTabsToUpdate: [], pageLayoutWidgetsToUpdate: [] });
  });

  it('skips unrelated tabs and widgets, including the summary', () => {
    expect(
      buildUpdates(
        [
          {
            ...legacyTab,
            universalIdentifier: layout.tabs.summary.universalIdentifier,
          },
        ],
        [{ ...legacyWidget, type: WidgetType.CALL_RECORDING_SUMMARY }],
      ),
    ).toEqual({ pageLayoutTabsToUpdate: [], pageLayoutWidgetsToUpdate: [] });
  });

  it('restores previous tab defaults on down and retains the original Transcript widget default', () => {
    const overrides = { workspace: { title: 'Interview' } };
    const updates = buildUpdates([{ ...tab, overrides }], [widget], 'down');

    expect(updates).toEqual({
      pageLayoutTabsToUpdate: [{ ...legacyTab, overrides, updatedAt: NOW }],
      pageLayoutWidgetsToUpdate: [],
    });
    expect(
      buildUpdates(updates.pageLayoutTabsToUpdate, [widget], 'down'),
    ).toEqual({ pageLayoutTabsToUpdate: [], pageLayoutWidgetsToUpdate: [] });
  });
});
