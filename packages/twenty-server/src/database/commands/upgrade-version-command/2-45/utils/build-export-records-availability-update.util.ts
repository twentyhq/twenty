import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const EXPORT_RECORDS_UNIVERSAL_IDENTIFIER =
  'c6f5c54d-d52b-4e75-8188-2190d77126f2';

const PREVIOUS_EXPORT_RECORDS_EXPRESSION = 'permissionFlags.EXPORT_CSV';

const NEXT_EXPORT_RECORDS_EXPRESSION =
  'pageType == "INDEX_PAGE" and permissionFlags.EXPORT_CSV';

export const buildExportRecordsAvailabilityUpdate = ({
  flatCommandMenuItemsByUniversalIdentifier,
  now,
  direction,
}: {
  flatCommandMenuItemsByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
  direction: 'up' | 'down';
}): FlatCommandMenuItem[] => {
  const exportRecords =
    flatCommandMenuItemsByUniversalIdentifier[
      EXPORT_RECORDS_UNIVERSAL_IDENTIFIER
    ];

  const [fromExpression, toExpression] =
    direction === 'up'
      ? [PREVIOUS_EXPORT_RECORDS_EXPRESSION, NEXT_EXPORT_RECORDS_EXPRESSION]
      : [NEXT_EXPORT_RECORDS_EXPRESSION, PREVIOUS_EXPORT_RECORDS_EXPRESSION];

  if (
    !isDefined(exportRecords) ||
    exportRecords.conditionalAvailabilityExpression !== fromExpression
  ) {
    return [];
  }

  return [
    {
      ...exportRecords,
      conditionalAvailabilityExpression: toExpression,
      updatedAt: now,
    },
  ];
};
