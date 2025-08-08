import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { findDuplicateRecordFilterInNonAdvancedRecordFilters } from '@/object-record/record-filter/utils/findDuplicateRecordFilterInNonAdvancedRecordFilters';
import { getDateFilterDisplayValue } from '@/object-record/record-filter/utils/getDateFilterDisplayValue';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown =
  () => {
    const selectedOperandInDropdownCallbackState =
      useRecoilComponentCallbackState(selectedOperandInDropdownComponentState);

    const currentRecordFiltersCallbackState = useRecoilComponentCallbackState(
      currentRecordFiltersComponentState,
    );

    const objectFilterDropdownCurrentRecordFilterCallbackState =
      useRecoilComponentCallbackState(
        objectFilterDropdownCurrentRecordFilterComponentState,
      );

    const fieldMetadataItemUsedInDropdownCallbackState =
      useRecoilComponentCallbackState(
        fieldMetadataItemIdUsedInDropdownComponentState,
      );

    const objectFilterDropdownFilterIsSelectedCallbackState =
      useRecoilComponentCallbackState(
        objectFilterDropdownFilterIsSelectedComponentState,
      );

    const { upsertObjectFilterDropdownCurrentFilter } =
      useUpsertObjectFilterDropdownCurrentFilter();

    const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

    const initializeFilterOnFieldMetataItemFromViewBarFilterDropdown =
      useRecoilCallback(
        ({ set, snapshot }) =>
          (fieldMetadataItem: FieldMetadataItem) => {
            set(
              fieldMetadataItemUsedInDropdownCallbackState,
              fieldMetadataItem.id,
            );

            const currentRecordFilters = snapshot
              .getLoadable(currentRecordFiltersCallbackState)
              .getValue();

            const filterType = getFilterTypeFromFieldType(
              fieldMetadataItem.type,
            );

            if (filterType === 'RELATION' || filterType === 'SELECT') {
              pushFocusItemToFocusStack({
                focusId: VIEW_BAR_FILTER_DROPDOWN_ID,
                component: {
                  type: FocusComponentType.DROPDOWN,
                  instanceId: fieldMetadataItem.id,
                },
                globalHotkeysConfig: {
                  enableGlobalHotkeysConflictingWithKeyboard: false,
                },
              });
            }

            set(objectFilterDropdownFilterIsSelectedCallbackState, true);

            const defaultOperand = getRecordFilterOperands({
              filterType,
            })[0];

            const duplicateFilterInCurrentRecordFilters =
              findDuplicateRecordFilterInNonAdvancedRecordFilters({
                recordFilters: currentRecordFilters,
                fieldMetadataItemId: fieldMetadataItem.id,
              });

            const filterIsAlreadyInCurrentRecordFilters = isDefined(
              duplicateFilterInCurrentRecordFilters,
            );

            if (filterIsAlreadyInCurrentRecordFilters) {
              set(
                objectFilterDropdownCurrentRecordFilterCallbackState,
                duplicateFilterInCurrentRecordFilters,
              );

              set(
                selectedOperandInDropdownCallbackState,
                duplicateFilterInCurrentRecordFilters.operand,
              );
            } else {
              set(selectedOperandInDropdownCallbackState, defaultOperand);

              if (filterType === 'DATE' || filterType === 'DATE_TIME') {
                const date = new Date();
                const value = date.toISOString();

                const { displayValue } = getDateFilterDisplayValue(
                  date,
                  filterType,
                );

                const initialDateRecordFilter: RecordFilter = {
                  id: v4(),
                  fieldMetadataId: fieldMetadataItem.id,
                  operand: defaultOperand,
                  displayValue,
                  label: fieldMetadataItem.label,
                  type: filterType,
                  value,
                };

                upsertObjectFilterDropdownCurrentFilter(
                  initialDateRecordFilter,
                );

                set(
                  objectFilterDropdownCurrentRecordFilterCallbackState,
                  initialDateRecordFilter,
                );
              }
            }
          },
        [
          fieldMetadataItemUsedInDropdownCallbackState,
          currentRecordFiltersCallbackState,
          objectFilterDropdownFilterIsSelectedCallbackState,
          pushFocusItemToFocusStack,
          objectFilterDropdownCurrentRecordFilterCallbackState,
          selectedOperandInDropdownCallbackState,
          upsertObjectFilterDropdownCurrentFilter,
        ],
      );

    return {
      initializeFilterOnFieldMetataItemFromViewBarFilterDropdown,
    };
  };
