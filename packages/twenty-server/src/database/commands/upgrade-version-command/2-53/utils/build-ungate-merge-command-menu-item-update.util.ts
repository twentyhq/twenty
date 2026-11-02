import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export const MERGE_MULTIPLE_RECORDS_UNIVERSAL_IDENTIFIER =
  '6c14eb04-8e7e-4d47-93c0-8ec4834e2e60';

export const GATED_MERGE_AVAILABILITY_EXPRESSION =
  'not isSelectAll and numberOfSelectedRecords >= 2 and isDefined(objectMetadataItem.duplicateCriteria) and objectPermissions.canUpdateObjectRecords and objectPermissions.canDestroyObjectRecords and numberOfSelectedRecords <= 9';

export const UNGATED_MERGE_AVAILABILITY_EXPRESSION =
  'not isSelectAll and numberOfSelectedRecords >= 2 and not objectMetadataItem.isSystem and objectMetadataItem.nameSingular != "workflow" and objectMetadataItem.nameSingular != "dashboard" and objectPermissions.canUpdateObjectRecords and objectPermissions.canDestroyObjectRecords and numberOfSelectedRecords <= 9';

export const buildUngateMergeCommandMenuItemUpdate = ({
  flatCommandMenuItemMaps,
  direction,
  now,
}: {
  flatCommandMenuItemMaps: Pick<
    FlatEntityMaps<FlatCommandMenuItem>,
    'byUniversalIdentifier'
  >;
  direction: 'up' | 'down';
  now: string;
}): FlatCommandMenuItem | undefined => {
  const mergeCommandMenuItem =
    flatCommandMenuItemMaps.byUniversalIdentifier[
      MERGE_MULTIPLE_RECORDS_UNIVERSAL_IDENTIFIER
    ];

  const [fromExpression, toExpression] =
    direction === 'up'
      ? [
          GATED_MERGE_AVAILABILITY_EXPRESSION,
          UNGATED_MERGE_AVAILABILITY_EXPRESSION,
        ]
      : [
          UNGATED_MERGE_AVAILABILITY_EXPRESSION,
          GATED_MERGE_AVAILABILITY_EXPRESSION,
        ];

  if (
    !isDefined(mergeCommandMenuItem) ||
    mergeCommandMenuItem.applicationUniversalIdentifier !==
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
    mergeCommandMenuItem.conditionalAvailabilityExpression !== fromExpression
  ) {
    return undefined;
  }

  return {
    ...mergeCommandMenuItem,
    conditionalAvailabilityExpression: toExpression,
    updatedAt: now,
  };
};
