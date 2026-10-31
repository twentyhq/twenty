import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { buildMessagesTabMigration } from 'src/database/commands/upgrade-version-command/2-55/utils/build-messages-tab-migration.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-30T12:00:00.000Z';
const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-10-29T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
    isWorkspaceCreation: true,
  },
);

const buildMigration = ({
  tabs = [],
  widgets = [],
}: {
  tabs?: FlatPageLayoutTab[];
  widgets?: FlatPageLayoutWidget[];
}) =>
  buildMessagesTabMigration({
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
])('buildMessagesTabMigration for %s', (_objectName, recordPage) => {
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
  const conversationsWidget: FlatPageLayoutWidget = {
    ...widget,
    id: '20202020-3333-4333-8333-333333333333',
    universalIdentifier:
      recordPage.tabs.conversations.widgets.conversations.universalIdentifier,
    title: 'Conversations',
  };
  const conversationsTab: FlatPageLayoutTab = {
    ...tab,
    id: '20202020-4444-4444-8444-444444444444',
    universalIdentifier: recordPage.tabs.conversations.universalIdentifier,
    title: 'Conversations',
    icon: 'IconMessage',
    widgetIds: [conversationsWidget.id],
  };

  it('should match the standard application definition', () => {
    expect(tab).toMatchObject({ title: 'Messages', icon: 'IconMessages' });
    expect(widget).toMatchObject({ title: 'Messages' });
    expect(
      allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
        recordPage.tabs.conversations.universalIdentifier
      ],
    ).toBeUndefined();
  });

  it('should rename the Emails tab and remove the Conversations tab', () => {
    expect(
      buildMigration({
        tabs: [legacyTab, conversationsTab],
        widgets: [legacyWidget, conversationsWidget],
      }),
    ).toEqual({
      pageLayoutTabsToUpdate: [
        {
          ...legacyTab,
          title: 'Messages',
          icon: 'IconMessages',
          updatedAt: NOW,
        },
      ],
      pageLayoutWidgetsToUpdate: [
        { ...legacyWidget, title: 'Messages', updatedAt: NOW },
      ],
      pageLayoutTabsToDelete: [conversationsTab],
      pageLayoutWidgetsToDelete: [conversationsWidget],
    });
  });

  it('should keep a customized title and only update the default icon', () => {
    expect(
      buildMigration({ tabs: [{ ...legacyTab, title: 'Inbox' }] })
        .pageLayoutTabsToUpdate,
    ).toEqual([
      { ...legacyTab, title: 'Inbox', icon: 'IconMessages', updatedAt: NOW },
    ]);
  });

  it('should keep a Conversations tab that holds a widget the workspace added', () => {
    const { pageLayoutTabsToDelete, pageLayoutWidgetsToDelete } =
      buildMigration({
        tabs: [
          {
            ...conversationsTab,
            widgetIds: [
              conversationsWidget.id,
              '20202020-5555-4555-8555-555555555555',
            ],
          },
        ],
        widgets: [conversationsWidget],
      });

    expect(pageLayoutTabsToDelete).toEqual([]);
    expect(pageLayoutWidgetsToDelete).toEqual([conversationsWidget]);
  });

  it('should do nothing once the workspace is migrated', () => {
    expect(
      buildMigration({
        tabs: [tab, { ...conversationsTab, deletedAt: NOW }],
        widgets: [widget],
      }),
    ).toEqual({
      pageLayoutTabsToUpdate: [],
      pageLayoutWidgetsToUpdate: [],
      pageLayoutTabsToDelete: [],
      pageLayoutWidgetsToDelete: [],
    });
  });
});
