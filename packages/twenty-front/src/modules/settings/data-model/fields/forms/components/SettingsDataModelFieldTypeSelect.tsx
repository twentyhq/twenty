import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SETTINGS_FIELD_TYPE_CATEGORIES } from '@/settings/data-model/constants/SettingsFieldTypeCategories';
import { SETTINGS_FIELD_TYPE_CATEGORY_DESCRIPTIONS } from '@/settings/data-model/constants/SettingsFieldTypeCategoryDescriptions';
import {
  SETTINGS_FIELD_TYPE_CONFIGS,
  SettingsFieldTypeConfig,
} from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { useBooleanSettingsFormInitialValues } from '@/settings/data-model/fields/forms/boolean/hooks/useBooleanSettingsFormInitialValues';
import { useCurrencySettingsFormInitialValues } from '@/settings/data-model/fields/forms/currency/hooks/useCurrencySettingsFormInitialValues';
import { useSelectSettingsFormInitialValues } from '@/settings/data-model/fields/forms/select/hooks/useSelectSettingsFormInitialValues';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { useTheme } from '@emotion/react';
import { Section } from '@react-email/components';
import { useState } from 'react';
import { H2Title, IconChevronRight, IconSearch } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const settingsDataModelFieldTypeFormSchema = z.object({
  type: z.enum(
    Object.keys(SETTINGS_FIELD_TYPE_CONFIGS) as [
      SettingsSupportedFieldType,
      ...SettingsSupportedFieldType[],
    ],
  ),
});

export type SettingsDataModelFieldTypeFormValues = z.infer<
  typeof settingsDataModelFieldTypeFormSchema
>;

type SettingsDataModelFieldTypeSelectProps = {
  className?: string;
  excludedFieldTypes?: SettingsSupportedFieldType[];
  fieldMetadataItem?: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type'
  >;
  onFieldTypeSelect: () => void;
};

const StyledTypeSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: inherit;
  width: 100%;
`;

const StyledButton = styled(Button)<{ isActive: boolean }>`
  background: ${({ theme, isActive }) =>
    isActive ? theme.background.quaternary : theme.background.secondary};
  height: 40px;
  width: 100%;
  border-radius: ${({ theme }) => theme.border.radius.md};
`;
const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;
`;

const StyledButtonContainer = styled.div`
  display: flex;

  position: relative;
  width: calc(50% - ${({ theme }) => theme.spacing(1)});
`;

const StyledRightChevron = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.secondary};
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  top: 50%;
  transform: translateY(-50%);
`;
const StyledSearchInput = styled(TextInput)`
  width: 100%;
`;

export const SettingsDataModelFieldTypeSelect = ({
  className,
  excludedFieldTypes = [],
  fieldMetadataItem,
  onFieldTypeSelect,
}: SettingsDataModelFieldTypeSelectProps) => {
  const { control } = useFormContext<SettingsDataModelFieldTypeFormValues>();
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const fieldTypeConfigs = Object.entries<SettingsFieldTypeConfig>(
    SETTINGS_FIELD_TYPE_CONFIGS,
  ).filter(
    ([key, config]) =>
      !excludedFieldTypes.includes(key as SettingsSupportedFieldType) &&
      config.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const { resetDefaultValueField: resetBooleanDefaultValueField } =
    useBooleanSettingsFormInitialValues({ fieldMetadataItem });

  const { resetDefaultValueField: resetCurrencyDefaultValueField } =
    useCurrencySettingsFormInitialValues({ fieldMetadataItem });

  const { resetDefaultValueField: resetSelectDefaultValueField } =
    useSelectSettingsFormInitialValues({ fieldMetadataItem });

  const resetDefaultValueField = (nextValue: SettingsSupportedFieldType) => {
    switch (nextValue) {
      case FieldMetadataType.Boolean:
        resetBooleanDefaultValueField();
        break;
      case FieldMetadataType.Currency:
        resetCurrencyDefaultValueField();
        break;
      case FieldMetadataType.Select:
      case FieldMetadataType.MultiSelect:
        resetSelectDefaultValueField();
        break;
      default:
        break;
    }
  };

  return (
    <Controller
      name="type"
      control={control}
      defaultValue={
        fieldMetadataItem && fieldMetadataItem.type in fieldTypeConfigs
          ? (fieldMetadataItem.type as SettingsSupportedFieldType)
          : FieldMetadataType.Text
      }
      render={({ field: { onChange, value } }) => (
        <StyledTypeSelectContainer className={className}>
          <Section>
            <StyledSearchInput
              LeftIcon={IconSearch}
              placeholder="Search a type"
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </Section>
          {SETTINGS_FIELD_TYPE_CATEGORIES.map((category) => (
            <Section key={category}>
              <H2Title
                title={category}
                description={
                  SETTINGS_FIELD_TYPE_CATEGORY_DESCRIPTIONS[category]
                }
              />
              <StyledContainer>
                {fieldTypeConfigs
                  .filter(([, config]) => config.category === category)
                  .map(([key, config]) => (
                    <StyledButtonContainer>
                      <StyledButton
                        key={key}
                        onClick={() => {
                          onChange(key as SettingsSupportedFieldType);
                          resetDefaultValueField(
                            key as SettingsSupportedFieldType,
                          );
                          onFieldTypeSelect();
                        }}
                        title={config.label}
                        Icon={config.Icon}
                        size="small"
                        isActive={value === key}
                      />
                      <StyledRightChevron size={theme.icon.size.md} />
                    </StyledButtonContainer>
                  ))}
              </StyledContainer>
            </Section>
          ))}
        </StyledTypeSelectContainer>
      )}
    />
  );
};
