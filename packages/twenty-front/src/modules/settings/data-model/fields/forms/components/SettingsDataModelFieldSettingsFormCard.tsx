import styled from '@emotion/styled';
import omit from 'lodash.omit';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import {
  SettingsDataModelFieldBooleanForm,
  settingsDataModelFieldBooleanFormSchema,
} from '@/settings/data-model/fields/forms/components/boolean/SettingsDataModelFieldBooleanForm';
import {
  SettingsDataModelFieldCurrencyForm,
  settingsDataModelFieldCurrencyFormSchema,
} from '@/settings/data-model/fields/forms/components/currency/SettingsDataModelFieldCurrencyForm';
import { settingsDataModelFieldRelationFormSchema } from '@/settings/data-model/fields/forms/components/relation/SettingsDataModelFieldRelationForm';
import { SettingsDataModelFieldRelationSettingsFormCard } from '@/settings/data-model/fields/forms/components/relation/SettingsDataModelFieldRelationSettingsFormCard';
import {
  settingsDataModelFieldMultiSelectFormSchema,
  settingsDataModelFieldSelectFormSchema,
} from '@/settings/data-model/fields/forms/components/select/SettingsDataModelFieldSelectForm';
import { SettingsDataModelFieldSelectSettingsFormCard } from '@/settings/data-model/fields/forms/components/select/SettingsDataModelFieldSelectSettingsFormCard';
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
  .object({ type: z.literal(FieldMetadataType.Select) })
  .merge(settingsDataModelFieldSelectFormSchema);

const multiSelectFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.MultiSelect) })
  .merge(settingsDataModelFieldMultiSelectFormSchema);

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
    multiSelectFieldFormSchema,
    otherFieldsFormSchema,
  ],
);

type SettingsDataModelFieldSettingsFormCardProps = {
  disableCurrencyForm?: boolean;
  fieldMetadataItem: Pick<FieldMetadataItem, 'icon' | 'label' | 'type'> &
    Partial<Omit<FieldMetadataItem, 'icon' | 'label' | 'type'>>;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
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
}: SettingsDataModelFieldSettingsFormCardProps) => {
  if (!previewableTypes.includes(fieldMetadataItem.type)) return null;

  if (fieldMetadataItem.type === FieldMetadataType.Relation) {
    return (
      <SettingsDataModelFieldRelationSettingsFormCard
        fieldMetadataItem={fieldMetadataItem}
        objectMetadataItem={objectMetadataItem}
      />
    );
  }

  if (
    fieldMetadataItem.type === FieldMetadataType.Select ||
    fieldMetadataItem.type === FieldMetadataType.MultiSelect
  ) {
    return (
      <SettingsDataModelFieldSelectSettingsFormCard
        fieldMetadataItem={fieldMetadataItem}
        objectMetadataItem={objectMetadataItem}
      />
    );
  }

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
          fieldMetadataItem={fieldMetadataItem}
          objectMetadataItem={objectMetadataItem}
        />
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
        ) : undefined
      }
    />
  );
};
