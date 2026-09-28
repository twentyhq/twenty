import { isDefined } from 'twenty-shared/utils';

import { findFieldMetadataItemByDiffKey } from '@/activities/timeline-activities/utils/findFieldMetadataItemByDiffKey';
import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { isLogConsoleFieldValueEmpty } from '@/log-console/utils/isLogConsoleFieldValueEmpty';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type EventLogRecord } from '~/generated-metadata/graphql';

export const getLogConsoleRecordChangeFieldDiffs = ({
  entry,
  objectMetadataItem,
}: {
  entry: EventLogRecord;
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const valuesSnapshot =
    LOG_CONSOLE_RECORD_ACTIONS[entry.event]?.valuesSnapshot;

  const fieldDiffsByKey: Record<string, { before?: unknown; after?: unknown }> =
    isDefined(valuesSnapshot)
      ? Object.fromEntries(
          Object.entries(entry.properties?.[valuesSnapshot] ?? {}).map(
            ([key, value]) => [key, { [valuesSnapshot]: value }],
          ),
        )
      : (entry.properties?.diff ?? {});

  return Object.entries(fieldDiffsByKey).flatMap(([key, { before, after }]) => {
    const fieldMetadataItem = findFieldMetadataItemByDiffKey(
      objectMetadataItem.readableFields,
      key,
    );

    if (!isDefined(fieldMetadataItem) || fieldMetadataItem.isSystem) {
      return [];
    }

    const isRecordNameOfSnapshot =
      isDefined(valuesSnapshot) &&
      fieldMetadataItem.id ===
        objectMetadataItem.labelIdentifierFieldMetadataId;

    if (isRecordNameOfSnapshot) {
      return [];
    }

    const isEmpty = (value: unknown) =>
      isLogConsoleFieldValueEmpty({ fieldMetadataItem, value });

    if (isEmpty(before) && isEmpty(after)) {
      return [];
    }

    const isJoinColumn = key !== fieldMetadataItem.name;

    const toFieldValue = (value: unknown) =>
      isJoinColumn && isDefined(value) ? { id: value } : value;

    return [
      {
        key,
        fieldMetadataItem,
        before: toFieldValue(before),
        after: toFieldValue(after),
      },
    ];
  });
};
