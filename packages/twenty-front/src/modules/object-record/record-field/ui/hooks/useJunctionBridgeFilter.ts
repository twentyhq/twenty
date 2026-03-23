import { useMemo } from 'react';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem as ObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { detectJunctionBridge } from '@/object-record/record-field/ui/utils/junction/detectJunctionBridge';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

type UseJunctionBridgeFilterArgs = {
  objectMetadataItem: ObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem;
  recordId: string;
  objectMetadataItems: ObjectMetadataItem[];
  recordData: Record<string, unknown> | null | undefined;
};

export const useJunctionBridgeFilter = ({
  objectMetadataItem,
  fieldMetadataItem,
  recordData,
  objectMetadataItems,
}: UseJunctionBridgeFilterArgs): ObjectRecordFilterInput | undefined => {
  const bridge = useMemo(
    () =>
      detectJunctionBridge({
        objectMetadataItem,
        fieldMetadataItem,
        objectMetadataItems,
      }),
    [objectMetadataItem, fieldMetadataItem, objectMetadataItems],
  );

  // Extract the parent (sibling) record ID from record data.
  // Try the relation object first (e.g., recordData.carrier.id),
  // then fall back to the FK column (e.g., recordData.carrierId).
  const parentId = useMemo(() => {
    if (!isDefined(bridge)) {
      return undefined;
    }

    const parentFieldName = bridge.parentFieldName;

    const parentRelationValue = recordData?.[parentFieldName] as
      | { id: string }
      | null
      | undefined;

    if (isDefined(parentRelationValue?.id)) {
      return parentRelationValue.id;
    }

    // Fallback: check for the FK column value (e.g., "carrierId")
    const fkColumnValue = recordData?.[`${parentFieldName}Id`] as
      | string
      | null
      | undefined;

    if (isDefined(fkColumnValue) && typeof fkColumnValue === 'string') {
      return fkColumnValue;
    }

    return undefined;
  }, [bridge, recordData]);

  const junctionFilter: RecordGqlOperationFilter | undefined = isDefined(bridge)
    ? isDefined(parentId)
      ? { [bridge.sourceJoinColumnName]: { eq: parentId } }
      : undefined
    : undefined;

  // When bridge is null, skip is true so the query won't execute.
  // We still need a valid objectNameSingular because useFindManyRecords
  // unconditionally calls useObjectMetadataItem (React hooks can't be conditional),
  // which throws on empty string. Use 'person' as a safe placeholder.
  const { records: junctionRecords } = useFindManyRecords({
    objectNameSingular: bridge?.junctionObjectNameSingular ?? 'person',
    filter: junctionFilter,
    skip: !isDefined(bridge) || !isDefined(parentId),
  });

  return useMemo(() => {
    if (!isDefined(bridge) || !isDefined(parentId)) {
      return undefined;
    }

    const targetIds = junctionRecords
      .map(
        (record) => record[bridge.targetJoinColumnName] as string | undefined,
      )
      .filter((id): id is string => isDefined(id));

    if (targetIds.length === 0) {
      // Use a non-existent UUID to match zero records. The backend rejects
      // empty arrays in `in` filters, so we pass a sentinel value instead.
      return {
        id: { eq: '00000000-0000-0000-0000-000000000000' },
      } as ObjectRecordFilterInput;
    }

    return { id: { in: targetIds } } as ObjectRecordFilterInput;
  }, [bridge, parentId, junctionRecords]);
};
