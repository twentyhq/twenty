import { useMemo } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { useCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/useCombinedFindManyRecords';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { computeRelationFilterDisplayValue } from '@/views/utils/computeRelationFilterDisplayValue';

import { t } from '@lingui/core/macro';
import { type RecordGqlOperationSignature } from 'twenty-shared/types';
import {
  arrayOfUuidOrVariableSchema,
  isDefined,
  isNonEmptyArray,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

type UseComputeRecordRelationFilterDisplayValueParams = {
  recordFilter: RecordFilter;
};

// The stored displayValue is deprecated and empty for filters created without one, so compute the label at runtime.
export const useComputeRecordRelationFilterDisplayValue = ({
  recordFilter,
}: UseComputeRecordRelationFilterDisplayValueParams) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  if (!isDefined(recordFilter.fieldMetadataId)) {
    throw new Error(
      doNotTranslate('recordFilter.fieldMetadataId is not defined'),
    );
  }

  // Nested relation filters resolve records from the leaf relation's target object, direct filters from the source.
  const { fieldMetadataItem } = getFieldMetadataItemByIdOrThrow({
    fieldMetadataId:
      recordFilter.relationTargetFieldMetadataId ??
      recordFilter.fieldMetadataId,
    objectMetadataItems,
  });

  const targetObjectMetadataItems = useMemo(() => {
    const targetObjectMetadataIds =
      getTargetObjectMetadataIdsFromField(fieldMetadataItem);

    return objectMetadataItems.filter((objectMetadataItem) =>
      targetObjectMetadataIds.includes(objectMetadataItem.id),
    );
  }, [fieldMetadataItem, objectMetadataItems]);

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

  const operationSignatures = useMemo(
    () =>
      isNonEmptyArray(selectedRecordIds)
        ? targetObjectMetadataItems.map(
            (targetObjectMetadataItem): RecordGqlOperationSignature => ({
              objectNameSingular: targetObjectMetadataItem.nameSingular,
              variables: { filter: { id: { in: selectedRecordIds } } },
              fields: buildIdentifierGqlFields(targetObjectMetadataItem),
            }),
          )
        : [],
    [selectedRecordIds, targetObjectMetadataItems],
  );

  const { result, loading } = useCombinedFindManyRecords({
    operationSignatures,
    skip: !isNonEmptyArray(operationSignatures),
  });

  if (loading) {
    return { displayValue: t`Loading...`, loading };
  }

  const displayValue = computeRelationFilterDisplayValue({
    targetObjectMetadataItems,
    selectedRecordsByObjectNamePlural: result,
    isCurrentWorkspaceMemberSelected: isCurrentWorkspaceMemberSelected ?? false,
  });

  return { displayValue, loading };
};
