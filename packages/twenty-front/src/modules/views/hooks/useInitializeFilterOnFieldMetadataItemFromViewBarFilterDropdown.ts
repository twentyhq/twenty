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
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';

import { useRecoilCallback } from 'recoil';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
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
    const { getInitialFilterValue } = useGetInitialFilterValue();

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
          getInitialFilterValue,
        ],
      );

    return {
      initializeFilterOnFieldMetataItemFromViewBarFilterDropdown,
    };
  };
