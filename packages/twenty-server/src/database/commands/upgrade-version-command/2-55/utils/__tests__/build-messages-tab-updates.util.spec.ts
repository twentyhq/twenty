import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { buildMessagesTabUpdates } from 'src/database/commands/upgrade-version-command/2-55/utils/build-messages-tab-updates.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-30T12:00:00.000Z';
const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-10-29T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const buildUpdates = ({
  tabs = [],
  widgets = [],
}: {
  tabs?: FlatPageLayoutTab[];
  widgets?: FlatPageLayoutWidget[];
}) =>
  buildMessagesTabUpdates({
    flatPageLayoutTabsByUniversalIdentifier: Object.fromEntries(
      tabs.map((tab) => [tab.universalIdentifier, tab]),
    ),
    flatPageLayoutWidgetsByUniversalIdentifier: Object.fromEntries(
      widgets.map((widget) => [widget.universalIdentifier, widget]),
    ),
    now: NOW,
  });

describe.each([
  ['company', STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage],
  ['person', STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage],
  [
    'opportunity',
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage,
  ],
])('buildMessagesTabUpdates for %s', (_objectName, recordPage) => {
  const tab =
    allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
      recordPage.tabs.emails.universalIdentifier
    ];
  const widget =
    allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
      recordPage.tabs.emails.widgets.emails.universalIdentifier
    ];

  if (!isDefined(tab) || !isDefined(widget)) {
    throw new Error('Standard messages tab or widget is missing');
  }

  const legacyTab = { ...tab, title: 'Emails', icon: 'IconMail' };
  const legacyWidget = { ...widget, title: 'Emails' };

  it('should match the standard application definition', () => {
    expect(tab).toMatchObject({ title: 'Messages', icon: 'IconMessage' });
    expect(widget).toMatchObject({ title: 'Messages' });
  });

  it('should rename the default tab and widget', () => {
    expect(
      buildUpdates({ tabs: [legacyTab], widgets: [legacyWidget] }),
    ).toEqual({
      pageLayoutTabsToUpdate: [
        {
          ...legacyTab,
          title: 'Messages',
          icon: 'IconMessage',
          updatedAt: NOW,
        },
      ],
      pageLayoutWidgetsToUpdate: [
        { ...legacyWidget, title: 'Messages', updatedAt: NOW },
      ],
    });
  });

  it('should keep a customized title and only update the default icon', () => {
    expect(
      buildUpdates({ tabs: [{ ...legacyTab, title: 'Inbox' }] })
        .pageLayoutTabsToUpdate,
    ).toEqual([
      { ...legacyTab, title: 'Inbox', icon: 'IconMessage', updatedAt: NOW },
    ]);
  });

  it('should skip tabs and widgets that are already renamed or deleted', () => {
    expect(
      buildUpdates({
        tabs: [tab, { ...legacyTab, deletedAt: NOW }],
        widgets: [widget],
      }),
    ).toEqual({ pageLayoutTabsToUpdate: [], pageLayoutWidgetsToUpdate: [] });
  });
});
