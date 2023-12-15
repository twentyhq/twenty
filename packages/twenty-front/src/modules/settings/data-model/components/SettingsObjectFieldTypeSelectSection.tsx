import styled from '@emotion/styled';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Select } from '@/ui/input/components/Select';
import { Section } from '@/ui/layout/section/components/Section';
import { Field, FieldMetadataType } from '~/generated-metadata/graphql';

import { relationTypes } from '../constants/relationTypes';
import { settingsFieldMetadataTypes } from '../constants/settingsFieldMetadataTypes';

import {
  SettingsObjectFieldCurrencyForm,
  SettingsObjectFieldCurrencyFormValues,
} from './SettingsObjectFieldCurrencyForm';
import {
  SettingsObjectFieldPreview,
  SettingsObjectFieldPreviewProps,
} from './SettingsObjectFieldPreview';
import {
  SettingsObjectFieldRelationForm,
  SettingsObjectFieldRelationFormValues,
} from './SettingsObjectFieldRelationForm';
import {
  SettingsObjectFieldSelectForm,
  SettingsObjectFieldSelectFormValues,
} from './SettingsObjectFieldSelectForm';
import { SettingsObjectFieldTypeCard } from './SettingsObjectFieldTypeCard';

export type SettingsObjectFieldTypeSelectSectionFormValues = {
  type: FieldMetadataType;
  currency: SettingsObjectFieldCurrencyFormValues;
  relation: SettingsObjectFieldRelationFormValues;
  select: SettingsObjectFieldSelectFormValues;
};

type SettingsObjectFieldTypeSelectSectionProps = {
  disableCurrencyForm?: boolean;
  excludedFieldTypes?: FieldMetadataType[];
  fieldMetadata: Pick<Field, 'icon' | 'label'> & { id?: string };
  onChange: (
    values: Partial<SettingsObjectFieldTypeSelectSectionFormValues>,
  ) => void;
  relationFieldMetadata?: Pick<Field, 'id' | 'isCustom'>;
  values: SettingsObjectFieldTypeSelectSectionFormValues;
} & Pick<SettingsObjectFieldPreviewProps, 'objectMetadataId'>;

const StyledSettingsObjectFieldTypeCard = styled(SettingsObjectFieldTypeCard)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledSettingsObjectFieldPreview = styled(SettingsObjectFieldPreview)`
  display: grid;
  flex: 1 1 100%;
`;

const StyledRelationImage = styled.img<{ flip?: boolean }>`
  transform: ${({ flip }) => (flip ? 'scaleX(-1)' : 'none')};
  width: 54px;
`;

export const SettingsObjectFieldTypeSelectSection = ({
  disableCurrencyForm,
  excludedFieldTypes,
  fieldMetadata,
  objectMetadataId,
  onChange,
  relationFieldMetadata,
  values,
}: SettingsObjectFieldTypeSelectSectionProps) => {
  const currencyFormConfig = values.currency;
  const relationFormConfig = values.relation;
  const selectFormConfig = values.select;

  const fieldTypeOptions = Object.entries(settingsFieldMetadataTypes)
    .filter(([key]) => !excludedFieldTypes?.includes(key as FieldMetadataType))
    .map(([key, dataTypeConfig]) => ({
      value: key as FieldMetadataType,
      ...dataTypeConfig,
    }));

  return (
    <Section>
      <H2Title
        title="Type and values"
        description="The field's type and values."
      />
      <Select
        fullWidth
        disabled={!!fieldMetadata?.id}
        dropdownScopeId="object-field-type-select"
        value={values?.type}
        onChange={(value) => onChange({ type: value })}
        options={fieldTypeOptions}
      />
      {!!values?.type &&
        [
          FieldMetadataType.Boolean,
          FieldMetadataType.Currency,
          FieldMetadataType.DateTime,
          FieldMetadataType.Select,
          FieldMetadataType.Link,
          FieldMetadataType.Number,
          FieldMetadataType.Rating,
          FieldMetadataType.Relation,
          FieldMetadataType.Text,
        ].includes(values.type) && (
          <StyledSettingsObjectFieldTypeCard
            preview={
              <>
                <StyledSettingsObjectFieldPreview
                  fieldMetadata={{
                    ...fieldMetadata,
                    type: values.type,
                  }}
                  shrink={values.type === FieldMetadataType.Relation}
                  objectMetadataId={objectMetadataId}
                  relationObjectMetadataId={
                    relationFormConfig?.objectMetadataId
                  }
                  selectOptions={selectFormConfig}
                />
                {values.type === FieldMetadataType.Relation &&
                  !!relationFormConfig?.type &&
                  !!relationFormConfig.objectMetadataId && (
                    <>
                      <StyledRelationImage
                        src={relationTypes[relationFormConfig.type].imageSrc}
                        flip={
                          relationTypes[relationFormConfig.type].isImageFlipped
                        }
                        alt={relationTypes[relationFormConfig.type].label}
                      />
                      <StyledSettingsObjectFieldPreview
                        fieldMetadata={{
                          ...relationFormConfig.field,
                          label:
                            relationFormConfig.field?.label || 'Field name',
                          type: FieldMetadataType.Relation,
                          id: relationFieldMetadata?.id,
                        }}
                        shrink
                        objectMetadataId={relationFormConfig.objectMetadataId}
                        relationObjectMetadataId={objectMetadataId}
                      />
                    </>
                  )}
              </>
            }
            form={
              values.type === FieldMetadataType.Currency ? (
                <SettingsObjectFieldCurrencyForm
                  disabled={disableCurrencyForm}
                  values={currencyFormConfig}
                  onChange={(nextValues) =>
                    onChange({
                      currency: { ...currencyFormConfig, ...nextValues },
                    })
                  }
                />
              ) : values.type === FieldMetadataType.Relation ? (
                <SettingsObjectFieldRelationForm
                  disableFieldEdition={
                    relationFieldMetadata && !relationFieldMetadata.isCustom
                  }
                  disableRelationEdition={!!relationFieldMetadata}
                  values={relationFormConfig}
                  onChange={(nextValues) =>
                    onChange({
                      relation: { ...relationFormConfig, ...nextValues },
                    })
                  }
                />
              ) : values.type === FieldMetadataType.Select ? (
                <SettingsObjectFieldSelectForm
                  values={selectFormConfig}
                  onChange={(nextValues) => onChange({ select: nextValues })}
                />
              ) : undefined
            }
          />
        )}
    </Section>
  );
};
