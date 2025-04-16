import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { getSubFieldOptionKey } from '@/object-record/spreadsheet-import/utils/getSubFieldOptionKey';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { ReadonlyDeep } from 'type-fest';

export const MatchColumnSelectSubFieldSelectDropdownContent = ({
  fieldMetadataItem,
  onSubFieldSelect,
  options,
  onBack,
}: {
  fieldMetadataItem: FieldMetadataItem;
  onSubFieldSelect: (subFieldNameSelected: string) => void;
  options: readonly ReadonlyDeep<SelectOption>[];
  onBack: () => void;
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const { getIcon } = useIcons();

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    setSearchFilter(value);
  };

  const handleSubFieldSelect = (subFieldName: string) => {
    onSubFieldSelect(subFieldName);
  };

  const handleSubMenuBack = () => {
    setSearchFilter('');
    onBack();
  };

  if (!isCompositeField(fieldMetadataItem.type)) {
    return <></>;
  }

  const fieldMetadataItemSettings =
    SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldMetadataItem.type];

  const subFieldNamesThatExistInOptions = fieldMetadataItemSettings.subFields
    .filter((subFieldName) => {
      const optionKey = getSubFieldOptionKey(fieldMetadataItem, subFieldName);

      const correspondingOption = options.find(
        (option) => option.value === optionKey,
      );

      return isDefined(correspondingOption);
    })
    .filter((subFieldName) => subFieldName.includes(searchFilter));

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={handleSubMenuBack}
            Icon={IconChevronLeft}
          />
        }
      >
        <OverflowingTextWithTooltip text={fieldMetadataItem.label} />
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleFilterChange}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight width={200}>
        {subFieldNamesThatExistInOptions.map((subFieldName) => (
          <MenuItem
            key={subFieldName}
            onClick={() => handleSubFieldSelect(subFieldName)}
            LeftIcon={getIcon(fieldMetadataItem.icon)}
            text={
              (fieldMetadataItemSettings.labelBySubField as any)[subFieldName]
            }
            disabled={
              options.find(
                (option) =>
                  option.value ===
                  getSubFieldOptionKey(fieldMetadataItem, subFieldName),
              )?.disabled
            }
          />
        ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
