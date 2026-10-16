import { useEffect, useMemo, useState } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { usePerformCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/usePerformCombinedFindManyRecords';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeRelationFilterDisplayValue } from '@/views/utils/computeRelationFilterDisplayValue';

import { t } from '@lingui/core/macro';
import {
  arrayOfUuidOrVariableSchema,
  isDefined,
  isNonEmptyArray,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';

type UseComputeRecordRelationFilterDisplayValueParams = {
  recordFilter: RecordFilter;
};

// The stored displayValue is deprecated and empty for filters created without one, so compute the label at runtime.
export const useComputeRecordRelationFilterDisplayValue = ({
  recordFilter,
}: UseComputeRecordRelationFilterDisplayValueParams) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { performCombinedFindManyRecords } =
    usePerformCombinedFindManyRecords();

  if (!isDefined(recordFilter.fieldMetadataId)) {
    throw new Error('recordFilter.fieldMetadataId is not defined');
  }

  // Nested relation filters resolve records from the leaf relation's target object, direct filters from the source.
  const { fieldMetadataItem } = getFieldMetadataItemByIdOrThrow({
    fieldMetadataId:
      recordFilter.relationTargetFieldMetadataId ??
      recordFilter.fieldMetadataId,
    objectMetadataItems,
  });

  const readableTargetObjectMetadataItems = useMemo(() => {
    const targetObjectMetadataIds =
      getTargetObjectMetadataIdsFromField(fieldMetadataItem);

    return objectMetadataItems.filter(
      (objectMetadataItem) =>
        targetObjectMetadataIds.includes(objectMetadataItem.id) &&
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataItem.id,
        ).canReadObjectRecords === true,
    );
  }, [
    fieldMetadataItem,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
  ]);

  const { isCurrentWorkspaceMemberSelected, selectedRecordIds } = useMemo(
    () =>
      jsonRelationFilterValueSchema
        .catch({
          isCurrentWorkspaceMemberSelected: false,
          selectedRecordIds: arrayOfUuidOrVariableSchema.parse(
            recordFilter.value,
          ),
        })
        .parse(recordFilter.value),
    [recordFilter.value],
  );

  const shouldFetchSelectedRecords =
    isNonEmptyArray(selectedRecordIds) &&
    isNonEmptyArray(readableTargetObjectMetadataItems);

  const [
    selectedRecordsByObjectNamePlural,
    setSelectedRecordsByObjectNamePlural,
  ] = useState<Record<string, ObjectRecord[]>>({});
  const [loading, setLoading] = useState(shouldFetchSelectedRecords);

  // A filter chip has no user event to fetch from, so load whenever the selected ids or targets change.
  useEffect(() => {
    if (!shouldFetchSelectedRecords) {
      setSelectedRecordsByObjectNamePlural({});
      setLoading(false);
      return;
    }

    let isStale = false;

    setLoading(true);

    performCombinedFindManyRecords({
      operationSignatures: readableTargetObjectMetadataItems.map(
        (targetObjectMetadataItem) => ({
          objectNameSingular: targetObjectMetadataItem.nameSingular,
          variables: { filter: { id: { in: selectedRecordIds } } },
          fields: buildIdentifierGqlFields(targetObjectMetadataItem),
        }),
      ),
    })
      .then(({ result }) => {
        if (!isStale) {
          setSelectedRecordsByObjectNamePlural(result);
        }
      })
      .catch(() => {
        if (!isStale) {
          setSelectedRecordsByObjectNamePlural({});
        }
      })
      .finally(() => {
        if (!isStale) {
          setLoading(false);
        }
      });

    return () => {
      isStale = true;
    };
  }, [
    performCombinedFindManyRecords,
    readableTargetObjectMetadataItems,
    selectedRecordIds,
    shouldFetchSelectedRecords,
  ]);

  if (loading) {
    return { displayValue: t`Loading...`, loading };
  }

  const displayValue = computeRelationFilterDisplayValue({
    targetObjectMetadataItems: readableTargetObjectMetadataItems,
    selectedRecordsByObjectNamePlural,
    isCurrentWorkspaceMemberSelected: isCurrentWorkspaceMemberSelected ?? false,
  });

  return { displayValue, loading };
};
