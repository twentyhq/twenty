import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SETTINGS_FIELD_TYPE_CATEGORIES } from '@/settings/data-model/constants/SettingsFieldTypeCategories';
import { SETTINGS_FIELD_TYPE_CATEGORY_DESCRIPTIONS } from '@/settings/data-model/constants/SettingsFieldTypeCategoryDescriptions';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { type SettingsFieldTypeConfig } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { useBooleanSettingsFormInitialValues } from '@/settings/data-model/fields/forms/boolean/hooks/useBooleanSettingsFormInitialValues';
import { useCurrencySettingsFormInitialValues } from '@/settings/data-model/fields/forms/currency/hooks/useCurrencySettingsFormInitialValues';
import { useSelectSettingsFormInitialValues } from '@/settings/data-model/fields/forms/select/hooks/useSelectSettingsFormInitialValues';
import { type FieldType } from '@/settings/data-model/types/FieldType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Section } from '@react-email/components';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconSearch } from 'twenty-ui/display';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { type SettingsDataModelFieldTypeFormValues } from '~/pages/settings/data-model/new-field/SettingsObjectNewFieldSelect';

type SettingsObjectNewFieldSelectorProps = {
  className?: string;
  excludedFieldTypes?: FieldType[];
  fieldMetadataItem?: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type' | 'settings'
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

const StyledSearchInput = styled(SettingsTextInput)`
  width: 100%;
`;

export const SettingsObjectNewFieldSelector = ({
  excludedFieldTypes = [],
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
    useBooleanSettingsFormInitialValues({ existingFieldMetadataId: 'new' });

  const { resetDefaultValueField: resetCurrencyDefaultValueField } =
    useCurrencySettingsFormInitialValues({ existingFieldMetadataId: 'new' });

  const { resetDefaultValueField: resetSelectDefaultValueField } =
    useSelectSettingsFormInitialValues({
      fieldMetadataId: 'new',
    });

  const resetDefaultValueField = (nextValue: SettingsFieldType) => {
    switch (nextValue) {
      case FieldMetadataType.BOOLEAN:
        resetBooleanDefaultValueField();
        break;
      case FieldMetadataType.CURRENCY:
        resetCurrencyDefaultValueField();
        break;
      case FieldMetadataType.SELECT:
      case FieldMetadataType.MULTI_SELECT:
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
          instanceId="new-field-type-search"
          LeftIcon={IconSearch}
          placeholder={t`Search a type`}
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
                    // by default, we hide the relation type and create only the morph relation type
                    // on submit the new field, we choose the relation type based on the amount of target object
                    .filter(([key]) => key !== FieldMetadataType.RELATION)
                    .map(
                      ([key, config]) =>
                        [
                          key,
                          key === FieldMetadataType.MORPH_RELATION
                            ? { ...config, label: t`Relation` }
                            : config,
                        ] as [string, SettingsFieldTypeConfig<any>],
                    )
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
