import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownSelectedOptionValuesComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedOptionValuesComponentState';
import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { jsonRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/jsonRelationFilterValueSchema';
import { simpleRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/simpleRelationFilterValueSchema';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSetEditableFilterChipDropdownStates = () => {
  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const setEditableFilterChipDropdownStates = useRecoilCallback(
    ({ set }) =>
      (recordFilter: RecordFilter) => {
        const fieldMetadataItem = filterableFieldMetadataItems.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === recordFilter.fieldMetadataId,
        );

        if (!isDefined(fieldMetadataItem)) {
          return;
        }

        set(
          fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
            instanceId: recordFilter.id,
          }),
          fieldMetadataItem.id,
        );

        set(
          selectedOperandInDropdownComponentState.atomFamily({
            instanceId: recordFilter.id,
          }),
          recordFilter.operand,
        );

        set(
          selectedFilterComponentState.atomFamily({
            instanceId: recordFilter.id,
          }),
          recordFilter,
        );

        set(
          subFieldNameUsedInDropdownComponentState.atomFamily({
            instanceId: recordFilter.id,
          }),
          recordFilter.subFieldName,
        );

        if (recordFilter.type === 'RELATION') {
          const { selectedRecordIds } = jsonRelationFilterValueSchema
            .catch({
              isCurrentWorkspaceMemberSelected: false,
              selectedRecordIds: simpleRelationFilterValueSchema.parse(
                recordFilter.value,
              ),
            })
            .parse(recordFilter.value);

          set(
            objectFilterDropdownSelectedRecordIdsComponentState.atomFamily({
              instanceId: recordFilter.id,
            }),
            selectedRecordIds,
          );
        } else if (['SELECT', 'MULTI_SELECT'].includes(recordFilter.type)) {
          try {
            const selectedOptions = JSON.parse(recordFilter.value);

            set(
              objectFilterDropdownSelectedOptionValuesComponentState.atomFamily(
                {
                  instanceId: recordFilter.id,
                },
              ),
              selectedOptions,
            );
          } catch {
            set(
              objectFilterDropdownSelectedOptionValuesComponentState.atomFamily(
                {
                  instanceId: recordFilter.id,
                },
              ),
              [],
            );
          }
        }
      },
    [filterableFieldMetadataItems],
  );

  return {
    setEditableFilterChipDropdownStates,
  };
};
