import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useLingui } from '@lingui/react/macro';
import { IconAlertTriangle, IconChevronDown } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import { COLUMN_TYPES } from '../constants/columnTypes';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '../constants/settingsFieldType';
import {
  StyledDropdownTrigger,
  StyledSubTypeSelector,
  StyledTypeSelector,
  StyledTypeSelectorContainer,
  StyledWarningBox,
  StyledWarningContent,
  StyledWarningDescription,
  StyledWarningTitle,
} from '../SettingsImport.styles';
import { ColumnMappingValue } from '../types/ColumnMappingValue';
import { ColumnType } from '../types/ColumnType';

import { isCompositeType, isReservedFieldName } from '../utils/field.utils';
import { capitalizeFirst } from '../utils/format.utils';

export const TypeSelector = ({
  selectedMapping,
  onMappingChange,
  columnName,
}: {
  selectedMapping: ColumnMappingValue;
  onMappingChange: (mapping: ColumnMappingValue) => void;
  columnName: string;
}) => {
  const { t } = useLingui();

  const availableTypes = COLUMN_TYPES;

  const selectedTypeOption = availableTypes.find(
    (type) => type.value === selectedMapping.type,
  );
  const isIgnored = selectedMapping.type === 'DO_NOT_IMPORT';
  const isReserved = isReservedFieldName(
    computeMetadataNameFromLabel(columnName),
  );

  const handleTypeChange = (type: ColumnType) => {
    const newMapping: ColumnMappingValue = { type };
    if (isCompositeType(type)) {
      const compositeConfig = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[type];
      if (compositeConfig.subFields && compositeConfig.subFields.length > 0) {
        newMapping.subType = compositeConfig.subFields[0] as string;
      }
    }
    onMappingChange(newMapping);
  };

  const handleSubTypeChange = (subType: string) => {
    onMappingChange({ ...selectedMapping, subType });
  };

  const getSubTypeOptions = () => {
    if (!isCompositeType(selectedMapping.type)) return [];
    const compositeConfig =
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[selectedMapping.type];
    return (
      compositeConfig.subFields?.map((subFieldKey) => ({
        value: subFieldKey as string,
        label:
          compositeConfig.labelBySubField[
            subFieldKey as keyof typeof compositeConfig.labelBySubField
          ] || capitalizeFirst(subFieldKey as string),
      })) || []
    );
  };

  const subTypeOptions = getSubTypeOptions();
  const showSubTypeSelector =
    isCompositeType(selectedMapping.type) && subTypeOptions.length > 0;
  const column = computeMetadataNameFromLabel(columnName);
  return (
    <StyledTypeSelectorContainer>
      <StyledTypeSelector>
        <Dropdown
          dropdownId={`column-type-${columnName}`}
          dropdownHotkeyScope={{ scope: `column-type-${columnName}` }}
          clickableComponent={
            <StyledDropdownTrigger isIgnored={isIgnored}>
              <span>{selectedTypeOption?.label || selectedMapping.type}</span>
              <IconChevronDown size={16} />
            </StyledDropdownTrigger>
          }
          dropdownComponents={
            <>
              <DropdownMenuHeader>
                {t({ id: 'selectType.header', message: 'Select Type' })}
              </DropdownMenuHeader>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer hasMaxHeight>
                {availableTypes.map((type) => (
                  <MenuItemSelect
                    key={type.value}
                    selected={selectedMapping.type === type.value}
                    onClick={() => handleTypeChange(type.value)}
                    text={type.label}
                  />
                ))}
              </DropdownMenuItemsContainer>
            </>
          }
        />
      </StyledTypeSelector>

      {isReserved && !isIgnored && (
        <StyledWarningBox>
          <IconAlertTriangle size={20} />
          <StyledWarningContent>
            <StyledWarningTitle>
              {t({
                id: 'reservedFieldName.title',
                message: 'Reserved Field Name',
              })}
            </StyledWarningTitle>
            <StyledWarningDescription>
              {t`"${column}" is a reserved field name. Please select "Do not import" for this column or rename it in your source file.`}
            </StyledWarningDescription>
          </StyledWarningContent>
        </StyledWarningBox>
      )}

      {showSubTypeSelector && (
        <StyledSubTypeSelector>
          <Dropdown
            dropdownId={`column-subtype-${columnName}`}
            dropdownHotkeyScope={{ scope: `column-subtype-${columnName}` }}
            clickableComponent={
              <StyledDropdownTrigger>
                <span>
                  {subTypeOptions.find(
                    (opt) => opt.value === selectedMapping.subType,
                  )?.label ||
                    selectedMapping.subType ||
                    t({
                      id: 'selectSubtype.placeholder',
                      message: 'Select Subfield',
                    })}
                </span>
                <IconChevronDown size={16} />
              </StyledDropdownTrigger>
            }
            dropdownComponents={
              <>
                <DropdownMenuHeader>
                  {t({
                    id: 'selectSubtype.header',
                    message: 'Select Subfield',
                  })}
                </DropdownMenuHeader>
                <DropdownMenuSeparator />
                <DropdownMenuItemsContainer hasMaxHeight>
                  {subTypeOptions.map((subType) => (
                    <MenuItemSelect
                      key={subType.value}
                      selected={selectedMapping.subType === subType.value}
                      onClick={() => handleSubTypeChange(subType.value)}
                      text={subType.label}
                    />
                  ))}
                </DropdownMenuItemsContainer>
              </>
            }
          />
        </StyledSubTypeSelector>
      )}
    </StyledTypeSelectorContainer>
  );
};
