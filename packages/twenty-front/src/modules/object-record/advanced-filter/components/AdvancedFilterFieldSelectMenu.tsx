import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useApplyAdvancedFilterSourceField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterSourceField';
import { usePushFocusForLeafFieldValuePicker } from '@/object-record/advanced-filter/hooks/usePushFocusForLeafFieldValuePicker';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { isCompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFilterableFieldType';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { Fragment, useContext } from 'react';
import {
  getFilterTypeFromFieldType,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { Dropdown, useDropdownPage } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';

type AdvancedFilterFieldSelectMenuProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectMenu = ({
  recordFilterId,
}: AdvancedFilterFieldSelectMenuProps) => {
  const { closeAdvancedFilterFieldSelectDropdown } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);
  const { goToPage } = useDropdownPage();
  const { getIcon } = useIcons();
  const { t } = useLingui();
  const [objectFilterDropdownSearchInput, setObjectFilterDropdownSearchInput] =
    useAtomComponentState(objectFilterDropdownSearchInputComponentState);
  const { objectMetadataItem } = useContext(AdvancedFilterContext);
  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    objectMetadataItem.id,
  );
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const visibleFieldMetadataItemIds = visibleRecordFields.map(
    (recordField) => recordField.fieldMetadataItemId,
  );
  const filteredSearchInputFieldMetadataItems =
    filterableFieldMetadataItems.filter((fieldMetadataItem) =>
      fieldMetadataItem.label
        .toLocaleLowerCase()
        .includes(objectFilterDropdownSearchInput.toLocaleLowerCase()),
    );
  const visibleFieldMetadataItems = filteredSearchInputFieldMetadataItems
    .filter((fieldMetadataItem) =>
      visibleFieldMetadataItemIds.includes(fieldMetadataItem.id),
    )
    .toSorted(
      (firstField, secondField) =>
        visibleFieldMetadataItemIds.indexOf(firstField.id) -
        visibleFieldMetadataItemIds.indexOf(secondField.id),
    );
  const hiddenFieldMetadataItems = filteredSearchInputFieldMetadataItems
    .filter(
      (fieldMetadataItem) =>
        !visibleFieldMetadataItemIds.includes(fieldMetadataItem.id),
    )
    .toSorted((firstField, secondField) =>
      firstField.label.localeCompare(secondField.label),
    );
  const { applyAdvancedFilterSourceField } =
    useApplyAdvancedFilterSourceField();
  const setFieldMetadataItemIdUsedInDropdown = useSetAtomComponentState(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );
  const { pushFocusForLeafFieldValuePicker } =
    usePushFocusForLeafFieldValuePicker();

  const handleFieldMetadataItemSelect = (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    if (isManyToOneRelationField(fieldMetadataItem)) {
      setFieldMetadataItemIdUsedInDropdown(fieldMetadataItem.id);
      goToPage('relation-target');
      return;
    }

    if (
      isCompositeFilterableFieldType(
        getFilterTypeFromFieldType(fieldMetadataItem.type),
      )
    ) {
      setFieldMetadataItemIdUsedInDropdown(fieldMetadataItem.id);
      goToPage('composite');
      return;
    }

    applyAdvancedFilterSourceField({
      sourceFieldMetadataItem: fieldMetadataItem,
      recordFilterId,
    });
    pushFocusForLeafFieldValuePicker(fieldMetadataItem);
    closeAdvancedFilterFieldSelectDropdown();
  };

  const hasVisibleFields = isNonEmptyArray(visibleFieldMetadataItems);
  const sections = [
    {
      id: 'visible',
      label: t`Visible fields`,
      fields: visibleFieldMetadataItems,
    },
    {
      id: 'hidden',
      label: hasVisibleFields ? t`Hidden fields` : undefined,
      fields: hiddenFieldMetadataItems,
    },
  ].filter((section) => isNonEmptyArray(section.fields));

  return (
    <>
      <Dropdown.Search
        value={objectFilterDropdownSearchInput}
        placeholder={t`Search fields`}
        aria-label={t`Search fields`}
        onValueChange={setObjectFilterDropdownSearchInput}
      />
      {sections.map((section, index) => (
        <Fragment key={section.id}>
          {index > 0 && <Dropdown.Separator />}
          <Dropdown.Section label={section.label}>
            {section.fields.map((fieldMetadataItem) => (
              <Dropdown.OptionItem
                key={fieldMetadataItem.id}
                selected={false}
                indicator="none"
                closeOnSelect={false}
                onSelect={() =>
                  handleFieldMetadataItemSelect(fieldMetadataItem)
                }
                startIcon={
                  <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
                }
                hasSubmenu={
                  isManyToOneRelationField(fieldMetadataItem) ||
                  isCompositeFilterableFieldType(
                    getFilterTypeFromFieldType(fieldMetadataItem.type),
                  )
                }
              >
                {fieldMetadataItem.label}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        </Fragment>
      ))}
      {!isNonEmptyArray(sections) && (
        <Dropdown.Empty>{t`No fields found`}</Dropdown.Empty>
      )}
    </>
  );
};
