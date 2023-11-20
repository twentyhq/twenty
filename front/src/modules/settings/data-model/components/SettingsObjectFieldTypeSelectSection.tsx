import styled from '@emotion/styled';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Select } from '@/ui/input/components/Select';
import { Section } from '@/ui/layout/section/components/Section';
import { Field, FieldMetadataType } from '~/generated-metadata/graphql';

import { dataTypes } from '../constants/dataTypes';
import { relationTypes } from '../constants/relationTypes';

import {
  SettingsObjectFieldPreview,
  SettingsObjectFieldPreviewProps,
} from './SettingsObjectFieldPreview';
import {
  SettingsObjectFieldRelationForm,
  SettingsObjectFieldRelationFormValues,
} from './SettingsObjectFieldRelationForm';
import { SettingsObjectFieldTypeCard } from './SettingsObjectFieldTypeCard';

export type SettingsObjectFieldTypeSelectSectionFormValues = Partial<{
  type: FieldMetadataType;
  relation: SettingsObjectFieldRelationFormValues;
}>;

type SettingsObjectFieldTypeSelectSectionProps = {
  excludedFieldTypes?: FieldMetadataType[];
  fieldMetadata: Pick<Field, 'icon' | 'label'> & { id?: string };
  onChange: (values: SettingsObjectFieldTypeSelectSectionFormValues) => void;
  relationFieldMetadataId?: string;
  values?: SettingsObjectFieldTypeSelectSectionFormValues;
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
  excludedFieldTypes,
  fieldMetadata,
  objectMetadataId,
  onChange,
  relationFieldMetadataId,
  values,
}: SettingsObjectFieldTypeSelectSectionProps) => {
  const relationFormConfig = values?.relation;

  const fieldTypeOptions = Object.entries(dataTypes)
    .filter(([key]) => !excludedFieldTypes?.includes(key as FieldMetadataType))
    .map(([key, dataType]) => ({
      value: key as FieldMetadataType,
      ...dataType,
    }));

  return (
    <Section>
      <H2Title
        title="Type and values"
        description="The field's type and values."
      />
      <Select
        disabled={!!fieldMetadata.id}
        dropdownScopeId="object-field-type-select"
        value={values?.type}
        onChange={(value) => onChange({ type: value })}
        options={fieldTypeOptions}
      />
      {!!values?.type &&
        [
          FieldMetadataType.Boolean,
          FieldMetadataType.Currency,
          FieldMetadataType.Date,
          FieldMetadataType.Link,
          FieldMetadataType.Number,
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
                          id: relationFieldMetadataId,
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
              values.type === FieldMetadataType.Relation && (
                <SettingsObjectFieldRelationForm
                  disableRelationEdition={!!relationFieldMetadataId}
                  values={relationFormConfig}
                  onChange={(nextValues) =>
                    onChange({
                      relation: { ...relationFormConfig, ...nextValues },
                    })
                  }
                />
              )
            }
          />
        )}
    </Section>
  );
};
