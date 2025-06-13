import { useEffect, useMemo, useState } from 'react';
import { Key } from 'ts-key-enum';

import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { useOptionsForSelect } from '@/object-record/object-filter-dropdown/hooks/useOptionsForSelect';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { SingleRecordPickerHotkeyScope } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerHotkeyScope';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isNonEmptyString } from '@sniptt/guards';
import { MAX_OPTIONS_TO_DISPLAY } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem, MenuItemMultiSelect } from 'twenty-ui/navigation';

export const EMPTY_FILTER_VALUE = '';

type SelectOptionForFilter = FieldMetadataItemOption & {
  isSelected: boolean;
};

export const ObjectFilterDropdownOptionSelect = () => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const objectFilterDropdownSearchInput = useRecoilComponentValueV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    ObjectFilterDropdownComponentInstanceContext,
  );

  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValueV2(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const selectedOptions = useMemo(
    () =>
      isNonEmptyString(objectFilterDropdownCurrentRecordFilter?.value)
        ? (JSON.parse(
            objectFilterDropdownCurrentRecordFilter.value,
          ) as string[]) // TODO: replace by a safe parse
        : [],
    [objectFilterDropdownCurrentRecordFilter?.value],
  );

  const { closeDropdown } = useDropdown();

  const { resetSelectedItem } = useSelectableList(componentInstanceId);

  const selectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    componentInstanceId,
  );

  const fieldMetaDataId = fieldMetadataItemUsedInDropdown?.id ?? '';

  const { selectOptions } = useOptionsForSelect(fieldMetaDataId);

  const [selectableOptions, setSelectableOptions] = useState<
    SelectOptionForFilter[]
  >([]);

  useEffect(() => {
    if (isDefined(selectOptions)) {
      const options = selectOptions.map((option) => {
        const isSelected = selectedOptions?.includes(option.value) ?? false;

        return {
          ...option,
          isSelected,
        };
      });

      setSelectableOptions(options);
    }
  }, [selectedOptions, selectOptions]);

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
      resetSelectedItem();
    },
    SingleRecordPickerHotkeyScope.SingleRecordPicker,
    [closeDropdown, resetSelectedItem],
  );

  const handleMultipleOptionSelectChange = (
    optionChanged: SelectOptionForFilter,
    isSelected: boolean,
  ) => {
    if (!selectOptions) {
      return;
    }

    const newSelectableOptions = selectableOptions.map((option) =>
      option.id === optionChanged.id ? { ...option, isSelected } : option,
    );

    setSelectableOptions(newSelectableOptions);

    const selectedOptions = newSelectableOptions.filter(
      (option) => option.isSelected,
    );

    const filterDisplayValue =
      selectedOptions.length > MAX_OPTIONS_TO_DISPLAY
        ? `${selectedOptions.length} options`
        : selectedOptions.map((option) => option.label).join(', ');

    const newFilterValue =
      selectedOptions.length > 0
        ? JSON.stringify(selectedOptions.map((option) => option.value))
        : EMPTY_FILTER_VALUE;

    applyObjectFilterDropdownFilterValue(newFilterValue, filterDisplayValue);

    resetSelectedItem();
  };

  const optionsInDropdown = selectableOptions?.filter((option) =>
    option.label
      .toLowerCase()
      .includes(objectFilterDropdownSearchInput.toLowerCase()),
  );

  const showNoResult = optionsInDropdown?.length === 0;
  const objectRecordsIds = optionsInDropdown.map((option) => option.id);

  return (
    <SelectableList
      selectableListInstanceId={componentInstanceId}
      selectableItemIdArray={objectRecordsIds}
      hotkeyScope={SingleRecordPickerHotkeyScope.SingleRecordPicker}
    >
      <DropdownMenuItemsContainer hasMaxHeight>
        {showNoResult ? (
          <MenuItem text="No results" />
        ) : (
          optionsInDropdown?.map((option) => (
            <MenuItemMultiSelect
              key={option.id}
              selected={option.isSelected}
              isKeySelected={option.id === selectedItemId}
              onSelectChange={(selected) =>
                handleMultipleOptionSelectChange(option, selected)
              }
              text={option.label}
              color={option.color}
              className=""
            />
          ))
        )}
      </DropdownMenuItemsContainer>
    </SelectableList>
  );
};
