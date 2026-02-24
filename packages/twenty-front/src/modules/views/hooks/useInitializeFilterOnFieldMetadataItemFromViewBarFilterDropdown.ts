import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useGetInitialFilterValue } from '@/object-record/object-filter-dropdown/hooks/useGetInitialFilterValue';
import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { findDuplicateRecordFilterInNonAdvancedRecordFilters } from '@/object-record/record-filter/utils/findDuplicateRecordFilterInNonAdvancedRecordFilters';

import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';

import { useStore } from 'jotai';
import { useCallback } from 'react';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown =
  () => {
    const selectedOperandInDropdownCallbackState =
      useRecoilComponentStateCallbackStateV2(
        selectedOperandInDropdownComponentState,
      );

    const currentRecordFiltersCallbackState =
      useRecoilComponentStateCallbackStateV2(
        currentRecordFiltersComponentState,
      );

    const objectFilterDropdownCurrentRecordFilterCallbackState =
      useRecoilComponentStateCallbackStateV2(
        objectFilterDropdownCurrentRecordFilterComponentState,
      );

    const fieldMetadataItemUsedInDropdownCallbackState =
      useRecoilComponentStateCallbackStateV2(
        fieldMetadataItemIdUsedInDropdownComponentState,
      );

    const objectFilterDropdownFilterIsSelectedCallbackState =
      useRecoilComponentStateCallbackStateV2(
        objectFilterDropdownFilterIsSelectedComponentState,
      );

    const { upsertObjectFilterDropdownCurrentFilter } =
      useUpsertObjectFilterDropdownCurrentFilter();

    const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
    const { getInitialFilterValue } = useGetInitialFilterValue();

    const store = useStore();

    const initializeFilterOnFieldMetataItemFromViewBarFilterDropdown =
      useCallback(
        (fieldMetadataItem: FieldMetadataItem) => {
          store.set(
            fieldMetadataItemUsedInDropdownCallbackState,
            fieldMetadataItem.id,
          );

          const currentRecordFilters = store.get(
            currentRecordFiltersCallbackState,
          );

          const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

          if (filterType === 'RELATION' || filterType === 'SELECT') {
            pushFocusItemToFocusStack({
              focusId: ViewBarFilterDropdownIds.MAIN,
              component: {
                type: FocusComponentType.DROPDOWN,
                instanceId: fieldMetadataItem.id,
              },
              globalHotkeysConfig: {
                enableGlobalHotkeysConflictingWithKeyboard: false,
              },
            });
          }

          store.set(objectFilterDropdownFilterIsSelectedCallbackState, true);

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
            store.set(
              objectFilterDropdownCurrentRecordFilterCallbackState,
              duplicateFilterInCurrentRecordFilters,
            );

            store.set(
              selectedOperandInDropdownCallbackState,
              duplicateFilterInCurrentRecordFilters.operand,
            );
          } else {
            store.set(selectedOperandInDropdownCallbackState, defaultOperand);

            if (filterType === 'DATE' || filterType === 'DATE_TIME') {
              const { displayValue, value } = getInitialFilterValue(
                filterType,
                defaultOperand,
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

              upsertObjectFilterDropdownCurrentFilter(initialDateRecordFilter);

              store.set(
                objectFilterDropdownCurrentRecordFilterCallbackState,
                initialDateRecordFilter,
              );
            }
          }
        },
        [
          store,
          fieldMetadataItemUsedInDropdownCallbackState,
          currentRecordFiltersCallbackState,
          objectFilterDropdownFilterIsSelectedCallbackState,
          pushFocusItemToFocusStack,
          objectFilterDropdownCurrentRecordFilterCallbackState,
          selectedOperandInDropdownCallbackState,
          upsertObjectFilterDropdownCurrentFilter,
          getInitialFilterValue,
        ],
      );

    return {
      initializeFilterOnFieldMetataItemFromViewBarFilterDropdown,
    };
  };
