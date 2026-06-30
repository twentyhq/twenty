import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { getRecordGroupByValueLabel } from '@/object-record/record-show/utils/getRecordGroupByValueLabel';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useContext } from 'react';
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

  const isRelationGroupBy =
    isDefined(groupByFieldMetadataItem) &&
    isManyToOneRelationField(groupByFieldMetadataItem);

  const relationRecordId =
    isRelationGroupBy &&
    isDefined(rawGroupFieldValue) &&
    rawGroupFieldValue !== ''
      ? String(rawGroupFieldValue)
      : undefined;

  const relationObjectNameSingular = isRelationGroupBy
    ? groupByFieldMetadataItem?.relation?.targetObjectMetadata.nameSingular
    : undefined;

  const shouldFetchRelationRecord =
    isDefined(relationObjectNameSingular) && isDefined(relationRecordId);

  const { record: relationRecord, loading: isLoadingRelationRecord } =
    useFindOneRecord({
      objectNameSingular: relationObjectNameSingular ?? objectNameSingular,
      objectRecordId: relationRecordId ?? '',
      skip: !shouldFetchRelationRecord,
      withSoftDeleted: true,
    });

  const { identifierChipGeneratorPerObject } = useContext(
    PreComputedChipGeneratorsContext,
  );

  const identifierChipGenerator = isDefined(relationObjectNameSingular)
    ? identifierChipGeneratorPerObject[relationObjectNameSingular]
    : undefined;

  const groupValueLabel = getRecordGroupByValueLabel({
    groupByFieldMetadataItem,
    rawGroupFieldValue,
    relationRecordId,
    relationRecord,
    isLoadingRelationRecord,
    identifierChipGenerator,
  });

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
