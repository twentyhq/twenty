import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { buildConversationsTabIconUpdates } from 'src/database/commands/upgrade-version-command/2-56/utils/build-conversations-tab-icon-updates.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-11-05T12:00:00.000Z';
const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-11-04T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
    isWorkspaceCreation: true,
  },
);

const buildUpdates = (tabs: FlatPageLayoutTab[]) =>
  buildConversationsTabIconUpdates({
    flatPageLayoutTabsByUniversalIdentifier: Object.fromEntries(
      tabs.map((tab) => [tab.universalIdentifier, tab]),
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
])('buildConversationsTabIconUpdates for %s', (_objectName, recordPage) => {
  const tab =
    allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
      recordPage.tabs.conversations.universalIdentifier
    ];

  if (!isDefined(tab)) {
    throw new Error('Standard conversations tab is missing');
  }

  const legacyTab = { ...tab, icon: 'IconMessage' };

  it('should replace the legacy icon with the inbox icon', () => {
    expect(buildUpdates([legacyTab])).toEqual([
      { ...legacyTab, icon: 'IconInbox', updatedAt: NOW },
    ]);
  });

  it('should keep a customized icon', () => {
    expect(buildUpdates([{ ...legacyTab, icon: 'IconStar' }])).toEqual([]);
  });

  it('should do nothing once the workspace is migrated', () => {
    expect(buildUpdates([tab])).toEqual([]);
  });
});
