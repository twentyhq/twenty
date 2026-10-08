import { isDefined } from 'twenty-shared/utils';

import { buildExportRecordsAvailabilityUpdate } from 'src/database/commands/upgrade-version-command/2-45/utils/build-export-records-availability-update.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-01T12:00:00.000Z';
const EXPORT_RECORDS_UNIVERSAL_IDENTIFIER =
  'c6f5c54d-d52b-4e75-8188-2190d77126f2';
const PREVIOUS_EXPRESSION = 'permissionFlags.EXPORT_CSV';
const NEXT_EXPRESSION =
  'pageType == "INDEX_PAGE" and permissionFlags.EXPORT_CSV';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-30T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const buildExportRecords = (
  conditionalAvailabilityExpression: string,
): FlatCommandMenuItem => {
  const exportRecords =
    allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
      EXPORT_RECORDS_UNIVERSAL_IDENTIFIER
    ];

  if (!isDefined(exportRecords)) {
    throw new Error('Standard Export records command menu item missing');
  }

  return { ...exportRecords, conditionalAvailabilityExpression };
};

const buildUpdate = (
  exportRecords: FlatCommandMenuItem,
  direction: 'up' | 'down',
) =>
  buildExportRecordsAvailabilityUpdate({
    flatCommandMenuItemsByUniversalIdentifier: {
      [EXPORT_RECORDS_UNIVERSAL_IDENTIFIER]: exportRecords,
    },
    now: NOW,
    direction,
  });

describe('buildExportRecordsAvailabilityUpdate', () => {
  it('matches the standard application expression', () => {
    expect(
      allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
        EXPORT_RECORDS_UNIVERSAL_IDENTIFIER
      ]?.conditionalAvailabilityExpression,
    ).toBe(NEXT_EXPRESSION);
  });

  it('restricts Export to the index page on up', () => {
    const exportRecords = buildExportRecords(PREVIOUS_EXPRESSION);

    expect(buildUpdate(exportRecords, 'up')).toEqual([
      {
        ...exportRecords,
        conditionalAvailabilityExpression: NEXT_EXPRESSION,
        updatedAt: NOW,
      },
    ]);
  });

  it('restores the previous expression on down', () => {
    const exportRecords = buildExportRecords(NEXT_EXPRESSION);

    expect(buildUpdate(exportRecords, 'down')).toEqual([
      {
        ...exportRecords,
        conditionalAvailabilityExpression: PREVIOUS_EXPRESSION,
        updatedAt: NOW,
      },
    ]);
  });

  it('skips items already migrated or carrying another expression', () => {
    expect(buildUpdate(buildExportRecords(NEXT_EXPRESSION), 'up')).toEqual([]);
    expect(buildUpdate(buildExportRecords('isInSidePanel'), 'up')).toEqual([]);
  });

  it('skips workspaces without the item', () => {
    expect(
      buildExportRecordsAvailabilityUpdate({
        flatCommandMenuItemsByUniversalIdentifier: {},
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([]);
  });
});
