import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SETTINGS_FIELD_TYPE_CATEGORIES } from '@/settings/data-model/constants/SettingsFieldTypeCategories';
import { SETTINGS_FIELD_TYPE_CATEGORY_DESCRIPTIONS } from '@/settings/data-model/constants/SettingsFieldTypeCategoryDescriptions';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { SettingsFieldTypeConfig } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { useBooleanSettingsFormInitialValues } from '@/settings/data-model/fields/forms/boolean/hooks/useBooleanSettingsFormInitialValues';
import { useCurrencySettingsFormInitialValues } from '@/settings/data-model/fields/forms/currency/hooks/useCurrencySettingsFormInitialValues';
import { useSelectSettingsFormInitialValues } from '@/settings/data-model/fields/forms/select/hooks/useSelectSettingsFormInitialValues';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, IconSearch, UndecoratedLink } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { SettingsDataModelFieldTypeFormValues } from '~/pages/settings/data-model/SettingsObjectNewField/SettingsObjectNewFieldSelect';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type SettingsObjectNewFieldSelectorProps = {
  className?: string;
  excludedFieldTypes?: SettingsFieldType[];
  fieldMetadataItem?: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type'
  >;

  objectNamePlural: string;
};

const StyledTypeSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: inherit;
  width: 100%;
`;

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;
`;

const StyledCardContainer = styled.div`
  display: flex;

  position: relative;
  width: calc(50% - ${({ theme }) => theme.spacing(1)});
`;

const StyledSearchInput = styled(TextInput)`
  width: 100%;
`;

export const SettingsObjectNewFieldSelector = ({
  excludedFieldTypes = [],
  fieldMetadataItem,
  objectNamePlural,
}: SettingsObjectNewFieldSelectorProps) => {
  const theme = useTheme();
  const { control, setValue } =
    useFormContext<SettingsDataModelFieldTypeFormValues>();
  const [searchQuery, setSearchQuery] = useState('');
  const fieldTypeConfigs = Object.entries<SettingsFieldTypeConfig<any>>(
    SETTINGS_FIELD_TYPE_CONFIGS,
  ).filter(
    ([key, config]) =>
      !excludedFieldTypes.includes(key as SettingsFieldType) &&
      config.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const { resetDefaultValueField: resetBooleanDefaultValueField } =
    useBooleanSettingsFormInitialValues({ fieldMetadataItem });

  const { resetDefaultValueField: resetCurrencyDefaultValueField } =
    useCurrencySettingsFormInitialValues({ fieldMetadataItem });

  const { resetDefaultValueField: resetSelectDefaultValueField } =
    useSelectSettingsFormInitialValues({ fieldMetadataItem });

  const resetDefaultValueField = (nextValue: SettingsFieldType) => {
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
    <>
      {' '}
      <Section>
        <StyledSearchInput
          LeftIcon={IconSearch}
          placeholder="Search a type"
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </Section>
      <Controller
        name="type"
        control={control}
        render={() => (
          <StyledTypeSelectContainer>
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
                      <StyledCardContainer key={key}>
                        <UndecoratedLink
                          to={getSettingsPath(
                            SettingsPath.ObjectNewFieldConfigure,
                            { objectNamePlural },
                            { fieldType: key },
                          )}
                          fullWidth
                          onClick={() => {
                            setValue('type', key as SettingsFieldType);
                            resetDefaultValueField(key as SettingsFieldType);
                          }}
                        >
                          <SettingsCard
                            key={key}
                            Icon={
                              <config.Icon
                                size={theme.icon.size.xl}
                                stroke={theme.icon.stroke.sm}
                              />
                            }
                            title={config.label}
                          />
                        </UndecoratedLink>
                      </StyledCardContainer>
                    ))}
                </StyledContainer>
              </Section>
            ))}
          </StyledTypeSelectContainer>
        )}
      />
    </>
  );
};
