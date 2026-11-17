import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { findNonAdvancedRecordFilterForColumn } from '@/object-record/record-table/record-table-header/utils/findNonAdvancedRecordFilterForColumn';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { getEditableChipDropdownId } from '@/views/editable-chip/utils/getEditableChipDropdownId';
import { useSetEditableFilterChipDropdownStates } from '@/views/hooks/useSetEditableFilterChipDropdownStates';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useOpenRecordFilterChipFromTableHeader = () => {
  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const {
    createEmptyRecordFilterFromFieldMetadataItem,
    createEmptyRelationTargetRecordFilter,
  } = useCreateEmptyRecordFilterFromFieldMetadataItem();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { openDropdown } = useOpenDropdown();

  const { setEditableFilterChipDropdownStates } =
    useSetEditableFilterChipDropdownStates();

  const openRecordFilterChipFromTableHeader = ({
    fieldMetadataItemId,
    relationTargetFieldMetadataItem,
  }: {
    fieldMetadataItemId: string;
    relationTargetFieldMetadataItem?: FieldMetadataItem;
  }) => {
    const correspondingFieldMetadataItem = filterableFieldMetadataItems.find(
      (fieldMetadataItemToFind) =>
        fieldMetadataItemToFind.id === fieldMetadataItemId,
    );

    if (!isDefined(correspondingFieldMetadataItem)) {
      throw new Error(
        doNotTranslate(
          `Cannot find field metadata item with id : ${fieldMetadataItemId}`,
        ),
      );
    }

    const existingNonAdvancedRecordFilter =
      findNonAdvancedRecordFilterForColumn({
        recordFilters: currentRecordFilters,
        fieldMetadataItemId,
        relationTargetFieldMetadataId: relationTargetFieldMetadataItem?.id,
      });

    if (isDefined(existingNonAdvancedRecordFilter)) {
      setEditableFilterChipDropdownStates(existingNonAdvancedRecordFilter);
      openDropdown({
        dropdownComponentInstanceIdFromProps: getEditableChipDropdownId({
          recordFilterId: existingNonAdvancedRecordFilter.id,
        }),
      });
      return;
    }

    const createEmptyColumnRecordFilter = () => {
      if (isDefined(relationTargetFieldMetadataItem)) {
        return createEmptyRelationTargetRecordFilter({
          sourceFieldMetadataItem: correspondingFieldMetadataItem,
          relationTargetFieldMetadataItem,
        });
      }

      return createEmptyRecordFilterFromFieldMetadataItem(
        correspondingFieldMetadataItem,
      );
    };

    const { newRecordFilter } = createEmptyColumnRecordFilter();

    upsertRecordFilter(newRecordFilter);

    setEditableFilterChipDropdownStates(newRecordFilter);
    openDropdown({
      dropdownComponentInstanceIdFromProps: getEditableChipDropdownId({
        recordFilterId: newRecordFilter.id,
      }),
    });
  };

  return { openRecordFilterChipFromTableHeader };
};
