import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SETTINGS_FIELD_TYPE_CATEGORIES } from '@/settings/data-model/constants/SettingsFieldTypeCategories';
import { SETTINGS_FIELD_TYPE_CATEGORY_DESCRIPTIONS } from '@/settings/data-model/constants/SettingsFieldTypeCategoryDescriptions';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { SettingsFieldTypeConfig } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { useBooleanSettingsFormInitialValues } from '@/settings/data-model/fields/forms/boolean/hooks/useBooleanSettingsFormInitialValues';
import { useCurrencySettingsFormInitialValues } from '@/settings/data-model/fields/forms/currency/hooks/useCurrencySettingsFormInitialValues';
import { useSelectSettingsFormInitialValues } from '@/settings/data-model/fields/forms/select/hooks/useSelectSettingsFormInitialValues';
import { FieldType } from '@/settings/data-model/types/FieldType';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { SettingsPath } from '@/types/SettingsPath';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Section } from '@react-email/components';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, IconSearch } from 'twenty-ui/display';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FeatureFlagKey } from '~/generated/graphql';
import { SettingsDataModelFieldTypeFormValues } from '~/pages/settings/data-model/new-field/SettingsObjectNewFieldSelect';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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
  const isMorphRelationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MORPH_RELATION_ENABLED,
  );
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
                    .filter(([key]) => {
                      return (
                        key !== FieldMetadataType.MORPH_RELATION ||
                        isMorphRelationEnabled
                      );
                    })
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
