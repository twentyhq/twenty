import { useMemo } from 'react';
import { type RecordGqlOperationSignature } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/useCombinedFindManyRecords';

export const useLinkedRecordsIdentifiers = ({
  timelineActivities,
  objectMetadataItems,
}: {
  timelineActivities: TimelineActivity[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
}) => {
  const operationSignatures = useMemo(() => {
    const objectMetadataItemById = new Map(
      objectMetadataItems.map((objectMetadataItem) => [
        objectMetadataItem.id,
        objectMetadataItem,
      ]),
    );
    const objectMetadataItemByUniversalIdentifier = new Map(
      objectMetadataItems.map((objectMetadataItem) => [
        objectMetadataItem.universalIdentifier,
        objectMetadataItem,
      ]),
    );
    const recordIdsByObjectMetadataId = new Map<string, Set<string>>();

    for (const timelineActivity of timelineActivities) {
      if (
        !isDefined(timelineActivity.linkedObjectMetadataId) ||
        !isDefined(timelineActivity.linkedRecordId)
      ) {
        continue;
      }

      const linkedObjectMetadataItem =
        objectMetadataItemById.get(timelineActivity.linkedObjectMetadataId) ??
        (isDefined(
          timelineActivity.timelineActivityTypeSnapshot
            ?.objectUniversalIdentifier,
        )
          ? objectMetadataItemByUniversalIdentifier.get(
              timelineActivity.timelineActivityTypeSnapshot
                .objectUniversalIdentifier,
            )
          : undefined);

      if (!isDefined(linkedObjectMetadataItem)) {
        continue;
      }

      const recordIds =
        recordIdsByObjectMetadataId.get(linkedObjectMetadataItem.id) ??
        new Set<string>();

      recordIds.add(timelineActivity.linkedRecordId);
      recordIdsByObjectMetadataId.set(linkedObjectMetadataItem.id, recordIds);
    }

    return [...recordIdsByObjectMetadataId.entries()]
      .map(([objectMetadataId, recordIds]) => {
        const objectMetadataItem = objectMetadataItemById.get(objectMetadataId);
        const labelIdentifierField = objectMetadataItem?.fields.find(
          (field) =>
            field.id === objectMetadataItem.labelIdentifierFieldMetadataId,
        );

        if (
          !isDefined(objectMetadataItem) ||
          !isDefined(labelIdentifierField)
        ) {
          return undefined;
        }

        return {
          objectNameSingular: objectMetadataItem.nameSingular,
          variables: { filter: { id: { in: [...recordIds] } } },
          fields: { id: true, [labelIdentifierField.name]: true },
        } satisfies RecordGqlOperationSignature;
      })
      .filter(isDefined);
  }, [objectMetadataItems, timelineActivities]);

  return useCombinedFindManyRecords({
    operationSignatures,
    skip: !isNonEmptyArray(operationSignatures),
  });
};
