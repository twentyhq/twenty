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
import { Section } from '@react-email/components';
import { useState } from 'react';
import { H2Title } from 'twenty-ui';
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
  disabled?: boolean;
  excludedFieldTypes?: SettingsSupportedFieldType[];
  fieldMetadataItem?: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type'
  >;
  selectedFieldType?: SettingsSupportedFieldType;
  setSelectedFieldType: any;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: inherit;
  width: 100%;
`;

const StyledButton = styled(Button)`
  height: 40px;
  width: calc(50% - ${({ theme }) => theme.spacing(1)});
`;
const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-start;
  flex-wrap: wrap;
`;

const StyledInput = styled.input`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ theme }) => theme.background.transparent.lighter};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin: 0;
  outline: none;
  height: 32px;
  padding: 0 ${({ theme }) => theme.spacing(1)} 0
    ${({ theme }) => theme.spacing(2)};
  width: 100%;
  box-sizing: border-box;
  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
`;

export const SettingsDataModelFieldTypeSelect = ({
  className,
  disabled,
  excludedFieldTypes = [],
  fieldMetadataItem,
  selectedFieldType,
  setSelectedFieldType,
}: SettingsDataModelFieldTypeSelectProps) => {
  const { control } = useFormContext<SettingsDataModelFieldTypeFormValues>();
  const [searchQuery, setSearchQuery] = useState('');
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
        selectedFieldType ||
        (fieldMetadataItem &&
        fieldMetadataItem.type in SETTINGS_FIELD_TYPE_CONFIGS
          ? (fieldMetadataItem.type as SettingsSupportedFieldType)
          : FieldMetadataType.Text)
      }
      render={({ field: { onChange, value } }) => (
        <StyledContainer className={className}>
          <Section>
            <StyledInput
              type="text"
              placeholder="Search a field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <StyledButtonContainer>
                {fieldTypeConfigs
                  .filter(([, config]) => config.category === category)
                  .map(([key, config]) => (
                    <StyledButton
                      key={key}
                      onClick={() => {
                        onChange(key as SettingsSupportedFieldType);
                        resetDefaultValueField(
                          key as SettingsSupportedFieldType,
                        );
                        setSelectedFieldType(key as SettingsSupportedFieldType);
                      }}
                      disabled={disabled}
                      variant={value === key ? 'primary' : 'secondary'}
                      title={config.label}
                      Icon={config.Icon}
                      size="small"
                    />
                  ))}
              </StyledButtonContainer>
            </Section>
          ))}
        </StyledContainer>
      )}
    />
  );
};
