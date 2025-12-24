import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { useGetObjectMetadataItemById } from '@/object-metadata/hooks/useGetObjectMetadataItemById';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { lastObjectOperationThatResettedVirtualizationComponentState } from '@/object-record/record-table/virtualization/states/lastObjectOperationThatResettedVirtualizationComponentState';
import { objectOperationsState } from '@/object-record/states/objectOperationsComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined, mapById } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated/graphql';

export const RecordTableVirtualizedDataChangedEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { getObjectMetadataItemById } = useGetObjectMetadataItemById();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const [
    lastObjectOperationThatResettedVirtualization,
    setLastObjectOperationThatResettedVirtualization,
  ] = useRecoilComponentState(
    lastObjectOperationThatResettedVirtualizationComponentState,
  );

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const currentRecordSorts = useRecoilComponentValue(
    currentRecordSortsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const objectOperations = useRecoilValue(objectOperationsState);

  useEffect(() => {
    const lastObjectOperation = objectOperations.at(-1);

    if (
      !isDefined(lastObjectOperationThatResettedVirtualization) &&
      !isDefined(lastObjectOperation)
    ) {
      return;
    }

    if (
      lastObjectOperation?.id !==
      lastObjectOperationThatResettedVirtualization?.id
    ) {
      setLastObjectOperationThatResettedVirtualization(lastObjectOperation);

      if (isDefined(lastObjectOperation)) {
        if (
          lastObjectOperation.objectMetadataItemId !== objectMetadataItem.id
        ) {
          return;
        }

        if (lastObjectOperation.data.type === 'update-one') {
          const updateInput = lastObjectOperation.data.result.updateInput;

          const updatedFieldNames = Object.keys(updateInput ?? {}) ?? [];

          const updatedFieldMetadataItems = activeFieldMetadataItems.filter(
            (fieldMetadataItemToFilter) =>
              updatedFieldNames.includes(fieldMetadataItemToFilter.name) ||
              (fieldMetadataItemToFilter.type === FieldMetadataType.RELATION &&
                updatedFieldNames.includes(
                  `${fieldMetadataItemToFilter.name}Id`,
                )),
          );

          const updatedFieldMetadataItemIds =
            updatedFieldMetadataItems.map(mapById);

          const thereIsAnUpdateOnAFilteredField = currentRecordFilters.some(
            (recordFilter) =>
              updatedFieldMetadataItemIds.includes(
                recordFilter.fieldMetadataId,
              ),
          );

          const thereIsAnUpdateOnASortedField = currentRecordSorts.some(
            (recordSort) =>
              updatedFieldMetadataItemIds.includes(recordSort.fieldMetadataId),
          );

          if (updatedFieldNames.includes('position')) {
            resetVirtualizationBecauseDataChanged();
          } else if (
            thereIsAnUpdateOnAFilteredField ||
            thereIsAnUpdateOnASortedField
          ) {
            resetVirtualizationBecauseDataChanged();
          }
        } else {
          resetVirtualizationBecauseDataChanged();
        }
      }
    }
  }, [
    lastObjectOperationThatResettedVirtualization,
    objectOperations,
    setLastObjectOperationThatResettedVirtualization,
    resetVirtualizationBecauseDataChanged,
    activeFieldMetadataItems,
    currentRecordFilters,
    currentRecordSorts,
    getObjectMetadataItemById,
    objectMetadataItem.id,
  ]);

  return <></>;
};
