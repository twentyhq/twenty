import styled from '@emotion/styled';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelDefaultValueForm } from '@/settings/data-model/components/SettingsDataModelDefaultValue';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  SettingsObjectFieldCurrencyForm,
  SettingsObjectFieldCurrencyFormValues,
} from '@/settings/data-model/components/SettingsObjectFieldCurrencyForm';
import {
  SettingsObjectFieldRelationForm,
  SettingsObjectFieldRelationFormValues,
} from '@/settings/data-model/components/SettingsObjectFieldRelationForm';
import {
  SettingsObjectFieldSelectForm,
  SettingsObjectFieldSelectFormValues,
} from '@/settings/data-model/components/SettingsObjectFieldSelectForm';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import {
  SettingsDataModelFieldPreviewCard,
  SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export type SettingsDataModelFieldSettingsFormValues = {
  currency: SettingsObjectFieldCurrencyFormValues;
  relation: SettingsObjectFieldRelationFormValues;
  select: SettingsObjectFieldSelectFormValues;
  multiSelect: SettingsObjectFieldSelectFormValues;
  defaultValue: any;
};

type SettingsDataModelFieldSettingsFormCardProps = {
  disableCurrencyForm?: boolean;
  onChange: (values: Partial<SettingsDataModelFieldSettingsFormValues>) => void;
  relationFieldMetadataItem?: Pick<
    FieldMetadataItem,
    'id' | 'isCustom' | 'name'
  >;
  values: SettingsDataModelFieldSettingsFormValues;
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
  FieldMetadataType.Date,
  FieldMetadataType.Select,
  FieldMetadataType.MultiSelect,
  FieldMetadataType.Link,
  FieldMetadataType.Number,
  FieldMetadataType.Rating,
  FieldMetadataType.Relation,
  FieldMetadataType.Text,
  FieldMetadataType.Address,
  FieldMetadataType.RawJson,
  FieldMetadataType.Phone,
];

export const SettingsDataModelFieldSettingsFormCard = ({
  disableCurrencyForm,
  fieldMetadataItem,
  objectMetadataItem,
  onChange,
  relationFieldMetadataItem,
  values,
}: SettingsDataModelFieldSettingsFormCardProps) => {
  const { findObjectMetadataItemById } = useFilteredObjectMetadataItems();

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
            selectOptions={
              fieldMetadataItem.type === FieldMetadataType.MultiSelect
                ? values.multiSelect
                : values.select
            }
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
        ) : fieldMetadataItem.type === FieldMetadataType.MultiSelect ? (
          <SettingsObjectFieldSelectForm
            values={values.multiSelect}
            onChange={(nextMultiSelectValues) =>
              onChange({ multiSelect: nextMultiSelectValues })
            }
            isMultiSelect={true}
          />
        ) : fieldMetadataItem.type === FieldMetadataType.Boolean ? (
          <SettingsDataModelDefaultValueForm
            value={values.defaultValue}
            onChange={(nextValueDefaultValue) =>
              onChange({ defaultValue: nextValueDefaultValue })
            }
          />
        ) : undefined
      }
    />
  );
};
