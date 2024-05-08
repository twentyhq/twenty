import { useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import omit from 'lodash.omit';
import { z } from 'zod';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  SettingsDataModelFieldBooleanForm,
  settingsDataModelFieldBooleanFormSchema,
} from '@/settings/data-model/components/SettingsDataModelDefaultValue';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  SettingsDataModelFieldCurrencyForm,
  settingsDataModelFieldCurrencyFormSchema,
} from '@/settings/data-model/components/SettingsObjectFieldCurrencyForm';
import {
  SettingsDataModelFieldRelationForm,
  settingsDataModelFieldRelationFormSchema,
} from '@/settings/data-model/components/SettingsObjectFieldRelationForm';
import {
  SettingsDataModelFieldSelectForm,
  settingsDataModelFieldSelectFormSchema,
} from '@/settings/data-model/components/SettingsObjectFieldSelectForm';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import {
  SettingsDataModelFieldPreviewCard,
  SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const booleanFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.Boolean) })
  .merge(settingsDataModelFieldBooleanFormSchema);

const currencyFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.Currency) })
  .merge(settingsDataModelFieldCurrencyFormSchema);

const relationFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.Relation) })
  .merge(settingsDataModelFieldRelationFormSchema);

const selectFieldFormSchema = z
  .object({
    type: z.enum([FieldMetadataType.Select, FieldMetadataType.MultiSelect]),
  })
  .merge(settingsDataModelFieldSelectFormSchema);

const otherFieldsFormSchema = z.object({
  type: z.enum(
    Object.keys(
      omit(SETTINGS_FIELD_TYPE_CONFIGS, [
        FieldMetadataType.Boolean,
        FieldMetadataType.Currency,
        FieldMetadataType.Relation,
        FieldMetadataType.Select,
        FieldMetadataType.MultiSelect,
      ]),
    ) as [FieldMetadataType, ...FieldMetadataType[]],
  ),
});

export const settingsDataModelFieldSettingsFormSchema = z.discriminatedUnion(
  'type',
  [
    booleanFieldFormSchema,
    currencyFieldFormSchema,
    relationFieldFormSchema,
    selectFieldFormSchema,
    otherFieldsFormSchema,
  ],
);

type SettingsDataModelFieldSettingsFormValues = z.infer<
  typeof settingsDataModelFieldSettingsFormSchema
>;

type SettingsDataModelFieldSettingsFormCardProps = {
  disableCurrencyForm?: boolean;
  fieldMetadataItem: Pick<FieldMetadataItem, 'icon' | 'label' | 'type'> &
    Partial<Omit<FieldMetadataItem, 'icon' | 'label' | 'type'>>;
  relationFieldMetadataItem?: FieldMetadataItem;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

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
  FieldMetadataType.Links,
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
  relationFieldMetadataItem,
}: SettingsDataModelFieldSettingsFormCardProps) => {
  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldSettingsFormValues>();
  const { findObjectMetadataItemById } = useFilteredObjectMetadataItems();

  if (!previewableTypes.includes(fieldMetadataItem.type)) return null;

  const relationObjectMetadataId = watchFormValue('relation.objectMetadataId');
  const relationObjectMetadataItem = relationObjectMetadataId
    ? findObjectMetadataItemById(relationObjectMetadataId)
    : undefined;

  const relationType = watchFormValue('relation.type');
  const relationTypeConfig = relationType
    ? RELATION_TYPES[relationType]
    : undefined;

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledPreviewContent>
          <StyledFieldPreviewCard
            fieldMetadataItem={fieldMetadataItem}
            shrink={fieldMetadataItem.type === FieldMetadataType.Relation}
            objectMetadataItem={objectMetadataItem}
            relationObjectMetadataItem={relationObjectMetadataItem}
            selectOptions={watchFormValue('options')}
          />
          {fieldMetadataItem.type === FieldMetadataType.Relation &&
            !!relationObjectMetadataItem &&
            !!relationTypeConfig && (
              <>
                <StyledRelationImage
                  src={relationTypeConfig.imageSrc}
                  flip={relationTypeConfig.isImageFlipped}
                  alt={relationTypeConfig.label}
                />
                <StyledFieldPreviewCard
                  fieldMetadataItem={{
                    ...relationFieldMetadataItem,
                    icon: watchFormValue('relation.field.icon'),
                    label:
                      watchFormValue('relation.field.label') || 'Field name',
                    type: FieldMetadataType.Relation,
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
        fieldMetadataItem.type === FieldMetadataType.Boolean ? (
          <SettingsDataModelFieldBooleanForm
            fieldMetadataItem={fieldMetadataItem}
          />
        ) : fieldMetadataItem.type === FieldMetadataType.Currency ? (
          <SettingsDataModelFieldCurrencyForm
            disabled={disableCurrencyForm}
            fieldMetadataItem={fieldMetadataItem}
          />
        ) : fieldMetadataItem.type === FieldMetadataType.Relation ? (
          <SettingsDataModelFieldRelationForm
            fieldMetadataItem={fieldMetadataItem}
          />
        ) : fieldMetadataItem.type === FieldMetadataType.Select ||
          fieldMetadataItem.type === FieldMetadataType.MultiSelect ? (
          <SettingsDataModelFieldSelectForm
            fieldMetadataItem={fieldMetadataItem}
            isMultiSelect={
              fieldMetadataItem.type === FieldMetadataType.MultiSelect
            }
          />
        ) : undefined
      }
    />
  );
};
