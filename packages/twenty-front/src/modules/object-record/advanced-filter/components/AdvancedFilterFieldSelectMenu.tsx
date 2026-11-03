import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useApplyAdvancedFilterSourceField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterSourceField';
import { usePushFocusForLeafFieldValuePicker } from '@/object-record/advanced-filter/hooks/usePushFocusForLeafFieldValuePicker';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { findFieldSelectLeadingFieldMetadataItem } from '@/object-record/advanced-filter/utils/findFieldSelectLeadingFieldMetadataItem';
import { getAdvancedFilterFieldSubPage } from '@/object-record/advanced-filter/utils/getAdvancedFilterFieldSubPage';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useLingui } from '@lingui/react/macro';
import { Fragment, useContext } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';

type AdvancedFilterFieldSelectMenuProps = {
  recordFilterId: string;
  searchInput: string;
  onSearchInputChange: (searchInput: string) => void;
  onSubPageFieldMetadataItemSelect: (
    fieldMetadataItem: FieldMetadataItem,
  ) => void;
};

export const AdvancedFilterFieldSelectMenu = ({
  recordFilterId,
  searchInput,
  onSearchInputChange,
  onSubPageFieldMetadataItemSelect,
}: AdvancedFilterFieldSelectMenuProps) => {
  const { closeAdvancedFilterFieldSelectDropdown } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);
  const { goToPage } = useDropdownPage();
  const { getIcon } = useIcons();
  const { t } = useLingui();
  const { objectMetadataItem, fieldSelectLeadingSections } = useContext(
    AdvancedFilterContext,
  );
  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    objectMetadataItem?.id ?? '',
  );
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const visibleFieldMetadataItemIds = visibleRecordFields.map(
    (recordField) => recordField.fieldMetadataItemId,
  );
  const isFieldMetadataItemMatchingSearchInput = (
    fieldMetadataItem: FieldMetadataItem,
  ) =>
    fieldMetadataItem.label
      .toLocaleLowerCase()
      .includes(searchInput.toLocaleLowerCase());
  const filteredSearchInputFieldMetadataItems =
    filterableFieldMetadataItems.filter(isFieldMetadataItemMatchingSearchInput);
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
  const { pushFocusForLeafFieldValuePicker } =
    usePushFocusForLeafFieldValuePicker();

  const getFieldSubPage = (fieldMetadataItem: FieldMetadataItem) =>
    isDefined(
      findFieldSelectLeadingFieldMetadataItem({
        fieldSelectLeadingSections,
        fieldMetadataId: fieldMetadataItem.id,
      }),
    )
      ? null
      : getAdvancedFilterFieldSubPage(fieldMetadataItem);

  const handleFieldMetadataItemSelect = (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    const subPage = getFieldSubPage(fieldMetadataItem);

    if (isDefined(subPage)) {
      onSubPageFieldMetadataItemSelect(fieldMetadataItem);
      goToPage(subPage);
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

  let hiddenFieldsSectionLabel: string | undefined;

  if (hasVisibleFields) {
    hiddenFieldsSectionLabel = t`Hidden fields`;
  } else if (isNonEmptyArray(fieldSelectLeadingSections)) {
    hiddenFieldsSectionLabel = objectMetadataItem?.labelSingular;
  }

  const sections = [
    ...(fieldSelectLeadingSections ?? []).map((fieldSelectLeadingSection) => ({
      id: fieldSelectLeadingSection.id,
      label: fieldSelectLeadingSection.label,
      fields: fieldSelectLeadingSection.fieldMetadataItems.filter(
        isFieldMetadataItemMatchingSearchInput,
      ),
    })),
    {
      id: 'visible',
      label: t`Visible fields`,
      fields: visibleFieldMetadataItems,
    },
    {
      id: 'hidden',
      label: hiddenFieldsSectionLabel,
      fields: hiddenFieldMetadataItems,
    },
  ].filter((section) => isNonEmptyArray(section.fields));

  return (
    <>
      <Dropdown.Search
        value={searchInput}
        placeholder={t`Search fields`}
        aria-label={t`Search fields`}
        onValueChange={onSearchInputChange}
      />
      {sections.map((section) => (
        <Fragment key={section.id}>
          <Dropdown.Separator />
          <Dropdown.Section label={section.label}>
            {section.fields.map((fieldMetadataItem) => (
              <Dropdown.OptionItem
                key={fieldMetadataItem.id}
                closeOnSelect={false}
                onSelect={() =>
                  handleFieldMetadataItemSelect(fieldMetadataItem)
                }
                startIcon={
                  <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
                }
                hasSubmenu={isDefined(getFieldSubPage(fieldMetadataItem))}
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
