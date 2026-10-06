import { useState } from 'react';
import { type ReadonlyDeep } from 'type-fest';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { MatchColumnSelectFieldSelectDropdownContent } from '@/spreadsheet-import/components/MatchColumnSelectFieldSelectDropdownContent';
import { MatchColumnSelectSubFieldSelectDropdownContent } from '@/spreadsheet-import/components/MatchColumnSelectSubFieldSelectDropdownContent';
import { DO_NOT_IMPORT_OPTION_KEY } from '@/spreadsheet-import/constants/DoNotImportOptionKey';
import { type SpreadsheetImportFieldOption } from '@/spreadsheet-import/types/SpreadsheetImportFieldOption';
import { hasNestedFields } from '@/spreadsheet-import/utils/spreadsheetImportHasNestedFields';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, MenuItem } from 'twenty-ui/components';
import { IconChevronDown } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

type MatchColumnToFieldSelectProps = {
  columnIndex: string;
  onChange: (value: ReadonlyDeep<SelectOption>) => void;
  value?: ReadonlyDeep<SelectOption>;
  options: readonly Readonly<SpreadsheetImportFieldOption>[];
  suggestedOptions: readonly ReadonlyDeep<SelectOption>[];
  placeholder?: string;
};

const StyledMenuItemContainer = styled.div`
  > div {
    background-color: ${themeCssVariables.background.transparent.lighter};
    border: 1px solid ${themeCssVariables.border.color.medium};
    border-radius: ${themeCssVariables.border.radius.sm};
  }
`;

export const MatchColumnToFieldSelect = ({
  onChange,
  value,
  options,
  suggestedOptions,
  placeholder,
  columnIndex,
}: MatchColumnToFieldSelectProps) => {
  const { t } = useLingui();
  const dropdownId = `match-column-select-dropdown-${columnIndex}`;
  const [selectedFieldMetadataItem, setSelectedFieldMetadataItem] =
    useState<FieldMetadataItem | null>(null);

  const doNotImportOption = options.find(
    (option) => option.value === DO_NOT_IMPORT_OPTION_KEY,
  );

  const handleFieldMetadataItemSelect = (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    if (hasNestedFields(fieldMetadataItem)) {
      setSelectedFieldMetadataItem(fieldMetadataItem);
      return;
    }

    const correspondingOption = options.find(
      (option) => option.value === fieldMetadataItem.name,
    );

    if (isDefined(correspondingOption)) {
      onChange(correspondingOption);
    }
  };

  const handleSubFieldSelect = (subFieldName: string) => {
    const correspondingOption = options.find(
      (option) => option.value === subFieldName,
    );

    if (isDefined(correspondingOption)) {
      onChange(correspondingOption);
    }
  };

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      onOpenChange={(open) => {
        if (!open) {
          setSelectedFieldMetadataItem(null);
        }
      }}
    >
      <Dropdown.Trigger
        render={<StyledMenuItemContainer />}
        nativeButton={false}
      >
        <MenuItem
          LeftIcon={value?.Icon}
          text={value?.label ?? placeholder ?? ''}
          accent={isDefined(value) ? 'default' : 'placeholder'}
          RightIcon={IconChevronDown}
        />
      </Dropdown.Trigger>
      <DropdownContent
        align="start"
        width={GenericDropdownContentWidth.ExtraLarge}
        aria-label={t`Select matching field`}
      >
        <Dropdown.Page id="root">
          <MatchColumnSelectFieldSelectDropdownContent
            selectedValue={value}
            onSelectFieldMetadataItem={handleFieldMetadataItemSelect}
            onSelectSuggestedOption={onChange}
            onDoNotImportSelect={() => {
              if (isDefined(doNotImportOption)) {
                onChange(doNotImportOption);
              }
            }}
            suggestedOptions={suggestedOptions}
          />
        </Dropdown.Page>
        <Dropdown.Page id="sub-field">
          {isDefined(selectedFieldMetadataItem) && (
            <MatchColumnSelectSubFieldSelectDropdownContent
              fieldMetadataItem={selectedFieldMetadataItem}
              selectedValue={value}
              onSubFieldSelect={handleSubFieldSelect}
              options={options}
            />
          )}
        </Dropdown.Page>
      </DropdownContent>
    </DropdownRoot>
  );
};
