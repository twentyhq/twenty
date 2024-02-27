import styled from '@emotion/styled';

import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import {
  SettingsDataModelFieldPreviewCard,
  SettingsDataModelFieldPreviewCardProps,
} from './SettingsDataModelFieldPreviewCard';
import { SettingsDataModelPreviewFormCard } from './SettingsDataModelPreviewFormCard';
import {
  SettingsObjectFieldCurrencyForm,
  SettingsObjectFieldCurrencyFormValues,
} from './SettingsObjectFieldCurrencyForm';
import {
  SettingsObjectFieldRelationForm,
  SettingsObjectFieldRelationFormValues,
} from './SettingsObjectFieldRelationForm';
import {
  SettingsObjectFieldSelectForm,
  SettingsObjectFieldSelectFormValues,
} from './SettingsObjectFieldSelectForm';

export type SettingsDataModelFieldPreviewFormValues = {
  currency: SettingsObjectFieldCurrencyFormValues;
  relation: SettingsObjectFieldRelationFormValues;
  select: SettingsObjectFieldSelectFormValues;
};

type SettingsDataModelFieldPreviewFormCardProps = {
  disableCurrencyForm?: boolean;
  onChange: (values: Partial<SettingsDataModelFieldPreviewFormValues>) => void;
  relationFieldMetadataItem?: Pick<
    FieldMetadataItem,
    'id' | 'isCustom' | 'name'
  >;
  values: SettingsDataModelFieldPreviewFormValues;
} & Pick<
  SettingsDataModelFieldPreviewCardProps,
  'fieldMetadataItem' | 'objectMetadataItem'
>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
`;

const StyledPreviewContent = styled.div`
  display: flex;
  gap: 6px;
`;

const StyledRelationImage = styled.img<{ flip?: boolean }>`
  transform: ${({ flip }) => (flip ? 'scaleX(-1)' : 'none')};
  width: 54px;
`;

const previewableTypes = [
  FieldMetadataType.Boolean,
  FieldMetadataType.Currency,
  FieldMetadataType.DateTime,
  FieldMetadataType.Select,
  FieldMetadataType.Link,
  FieldMetadataType.Number,
  FieldMetadataType.Rating,
  FieldMetadataType.Relation,
  FieldMetadataType.Text,
];

export const SettingsDataModelFieldPreviewFormCard = ({
  disableCurrencyForm,
  fieldMetadataItem,
  objectMetadataItem,
  onChange,
  relationFieldMetadataItem,
  values,
}: SettingsDataModelFieldPreviewFormCardProps) => {
  const { findObjectMetadataItemById } = useObjectMetadataItemForSettings();

  if (!previewableTypes.includes(fieldMetadataItem.type)) return null;

  const relationObjectMetadataItem = findObjectMetadataItemById(
    values.relation.objectMetadataId,
  );
  const relationTypeConfig = RELATION_TYPES[values.relation.type];

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledPreviewContent>
          <StyledFieldPreviewCard
            fieldMetadataItem={fieldMetadataItem}
            shrink={fieldMetadataItem.type === FieldMetadataType.Relation}
            objectMetadataItem={objectMetadataItem}
            relationObjectMetadataItem={relationObjectMetadataItem}
            selectOptions={values.select}
          />
          {fieldMetadataItem.type === FieldMetadataType.Relation &&
            !!relationObjectMetadataItem && (
              <>
                <StyledRelationImage
                  src={relationTypeConfig.imageSrc}
                  flip={relationTypeConfig.isImageFlipped}
                  alt={relationTypeConfig.label}
                />
                <StyledFieldPreviewCard
                  fieldMetadataItem={{
                    icon: values.relation.field.icon,
                    label: values.relation.field.label || 'Field name',
                    type: FieldMetadataType.Relation,
                    name: relationFieldMetadataItem?.name,
                    id: relationFieldMetadataItem?.id,
                  }}
                  shrink
                  objectMetadataItem={relationObjectMetadataItem}
                  relationObjectMetadataItem={objectMetadataItem}
                />
              </>
            )}
        </StyledPreviewContent>
      }
      form={
        fieldMetadataItem.type === FieldMetadataType.Currency ? (
          <SettingsObjectFieldCurrencyForm
            disabled={disableCurrencyForm}
            values={values.currency}
            onChange={(nextCurrencyValues) =>
              onChange({
                currency: { ...values.currency, ...nextCurrencyValues },
              })
            }
          />
        ) : fieldMetadataItem.type === FieldMetadataType.Relation ? (
          <SettingsObjectFieldRelationForm
            disableFieldEdition={
              relationFieldMetadataItem && !relationFieldMetadataItem.isCustom
            }
            disableRelationEdition={!!relationFieldMetadataItem}
            values={values.relation}
            onChange={(nextRelationValues) =>
              onChange({
                relation: { ...values.relation, ...nextRelationValues },
              })
            }
          />
        ) : fieldMetadataItem.type === FieldMetadataType.Select ? (
          <SettingsObjectFieldSelectForm
            values={values.select}
            onChange={(nextSelectValues) =>
              onChange({ select: nextSelectValues })
            }
          />
        ) : undefined
      }
    />
  );
};
