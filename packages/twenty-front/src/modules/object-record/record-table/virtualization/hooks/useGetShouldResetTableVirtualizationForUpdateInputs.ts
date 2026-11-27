import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { useGetRecordFieldLookupTarget } from '@/object-record/record-column-lookup/hooks/useGetRecordFieldLookupTarget';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, mapById } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useGetShouldResetTableVirtualizationForUpdateInputs = () => {
  const { objectMetadataItem, fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const currentRecordSorts = useAtomComponentStateValue(
    currentRecordSortsComponentState,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const getRecordFieldLookupTarget = useGetRecordFieldLookupTarget();

  const lookupRelationFieldMetadataItemIds = visibleRecordFields
    .filter((recordField) =>
      isDefined(
        getRecordFieldLookupTarget({
          recordField,
          fieldMetadataItem:
            fieldMetadataItemByFieldMetadataItemId[
              recordField.fieldMetadataItemId
            ],
        }),
      ),
    )
    .map(({ fieldMetadataItemId }) => fieldMetadataItemId);

  const getShouldResetTableVirtualizationForUpdateInputs = (
    updateInputs: ObjectRecordOperationUpdateInput[],
  ) => {
    const updatedFieldNames = new Set<string>();

    let thereIsAnUpdateOnAFilteredField = false;
    let thereIsAnUpdateOnASortedField = false;
    let thereIsAnUpdateOnALookupRelation = false;

    for (const updateInput of updateInputs) {
      const fieldNamesForUpdateInput = updateInput.updatedFields.flatMap(
        (updatedField) => Object.keys(updatedField ?? {}),
      );

      for (const fieldName of fieldNamesForUpdateInput) {
        updatedFieldNames.add(fieldName);
      }

      const updatedFieldMetadataItems = activeFieldMetadataItems.filter(
        (fieldMetadataItemToFilter) =>
          fieldNamesForUpdateInput.includes(fieldMetadataItemToFilter.name) ||
          (fieldMetadataItemToFilter.type === FieldMetadataType.RELATION &&
            fieldNamesForUpdateInput.includes(
              doNotTranslate(`${fieldMetadataItemToFilter.name}Id`),
            )),
      );

      const updatedFieldMetadataItemIds =
        updatedFieldMetadataItems.map(mapById);

      const updateOnAFilteredField = currentRecordFilters.some((recordFilter) =>
        updatedFieldMetadataItemIds.includes(recordFilter.fieldMetadataId),
      );

      const updateOnASortedField = currentRecordSorts.some((recordSort) =>
        updatedFieldMetadataItemIds.includes(recordSort.fieldMetadataId),
      );

      if (updateOnAFilteredField) {
        thereIsAnUpdateOnAFilteredField = true;
      }

      if (updateOnASortedField) {
        thereIsAnUpdateOnASortedField = true;
      }

      // The update returns the new related record without its looked-up field
      if (
        updatedFieldMetadataItemIds.some((fieldMetadataItemId) =>
          lookupRelationFieldMetadataItemIds.includes(fieldMetadataItemId),
        )
      ) {
        thereIsAnUpdateOnALookupRelation = true;
      }
    }

    if (updatedFieldNames.has('position')) {
      return true;
    }

    return (
      thereIsAnUpdateOnAFilteredField ||
      thereIsAnUpdateOnASortedField ||
      thereIsAnUpdateOnALookupRelation
    );
  };

  return {
    getShouldResetTableVirtualizationForUpdateInputs,
  };
};
