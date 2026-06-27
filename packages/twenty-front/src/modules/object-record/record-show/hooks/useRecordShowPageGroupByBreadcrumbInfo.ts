import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { getRecordGroupByValueLabelFromFieldValue } from '@/object-record/record-show/utils/getRecordGroupByValueLabelFromFieldValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { t } from '@lingui/core/macro';
import { useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordShowPageGroupByBreadcrumbInfo = ({
  objectNameSingular,
  objectRecordId,
}: {
  objectNameSingular: string;
  objectRecordId: string;
}) => {
  const { currentView } = useGetCurrentViewOnly();

  const { fieldMetadataItem: groupByFieldMetadataItem } =
    useFieldMetadataItemById(currentView?.mainGroupByFieldMetadataId ?? '');

  const groupByFieldGqlName = isDefined(groupByFieldMetadataItem)
    ? getFieldMetadataItemGqlFieldName(groupByFieldMetadataItem)
    : undefined;

  const { record, loading: isLoadingRecord } = useFindOneRecord({
    objectNameSingular,
    objectRecordId,
    recordGqlFields: isDefined(groupByFieldGqlName)
      ? { [groupByFieldGqlName]: true }
      : undefined,
    skip: !isDefined(groupByFieldMetadataItem),
  });

  const rawGroupFieldValue = isDefined(groupByFieldGqlName)
    ? record?.[groupByFieldGqlName]
    : undefined;

  const relationRecordId =
    isDefined(groupByFieldMetadataItem) &&
    isManyToOneRelationField(groupByFieldMetadataItem) &&
    isDefined(rawGroupFieldValue) &&
    rawGroupFieldValue !== ''
      ? String(rawGroupFieldValue)
      : undefined;

  const relationObjectNameSingular =
    isDefined(groupByFieldMetadataItem) &&
    isManyToOneRelationField(groupByFieldMetadataItem)
      ? groupByFieldMetadataItem.relation?.targetObjectMetadata.nameSingular
      : undefined;

  const shouldFetchRelationRecord =
    isDefined(relationObjectNameSingular) && isDefined(relationRecordId);

  const { record: relationRecord, loading: isLoadingRelationRecord } =
    useFindOneRecord({
      // useObjectMetadataItem runs even when skip is true - never pass an empty object name
      objectNameSingular: relationObjectNameSingular ?? objectNameSingular,
      objectRecordId: relationRecordId ?? '',
      skip: !shouldFetchRelationRecord,
      withSoftDeleted: true,
    });

  const { identifierChipGeneratorPerObject } = useContext(
    PreComputedChipGeneratorsContext,
  );

  const groupValueLabel = useMemo(() => {
    if (!isDefined(groupByFieldMetadataItem)) return undefined;

    if (
      isManyToOneRelationField(groupByFieldMetadataItem) &&
      isDefined(relationRecordId)
    ) {
      if (isLoadingRelationRecord) return undefined;
      if (!isDefined(relationRecord)) return t`Deleted`;

      const identifierChipGenerator =
        identifierChipGeneratorPerObject[relationObjectNameSingular ?? ''];

      if (!isDefined(identifierChipGenerator)) return undefined;

      return identifierChipGenerator(relationRecord).name;
    }

    return getRecordGroupByValueLabelFromFieldValue({
      groupByFieldMetadataItem,
      fieldValue: rawGroupFieldValue,
    });
  }, [
    groupByFieldMetadataItem,
    rawGroupFieldValue,
    relationRecord,
    relationRecordId,
    relationObjectNameSingular,
    isLoadingRelationRecord,
    identifierChipGeneratorPerObject,
  ]);

  const isGroupByActive = isDefined(groupByFieldMetadataItem);
  const isGroupValueLoading =
    isGroupByActive &&
    (isLoadingRecord ||
      (isDefined(relationRecordId) && isLoadingRelationRecord));

  return {
    viewName: currentView?.name,
    groupValueLabel,
    isGroupByActive,
    isGroupValueLoading,
  };
};
