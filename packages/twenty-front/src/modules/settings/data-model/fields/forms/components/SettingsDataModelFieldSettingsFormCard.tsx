import styled from '@emotion/styled';
import omit from 'lodash.omit';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { settingsDataModelFieldBooleanFormSchema } from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanForm';
import { SettingsDataModelFieldBooleanSettingsFormCard } from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanSettingsFormCard';
import { settingsDataModelFieldCurrencyFormSchema } from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencyForm';
import { SettingsDataModelFieldCurrencySettingsFormCard } from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencySettingsFormCard';
import { settingsDataModelFieldDateFormSchema } from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';
import { SettingsDataModelFieldDateSettingsFormCard } from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateSettingsFormCard';
import { settingsDataModelFieldNumberFormSchema } from '@/settings/data-model/fields/forms/number/components/SettingsDataModelFieldNumberForm';
import { SettingsDataModelFieldNumberSettingsFormCard } from '@/settings/data-model/fields/forms/number/components/SettingsDataModelFieldNumberSettingsFormCard';
import { settingsDataModelFieldRelationFormSchema } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationForm';
import { SettingsDataModelFieldRelationSettingsFormCard } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationSettingsFormCard';
import {
  settingsDataModelFieldMultiSelectFormSchema,
  settingsDataModelFieldSelectFormSchema,
} from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectForm';
import { SettingsDataModelFieldSelectSettingsFormCard } from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectSettingsFormCard';
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

const dateFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.Date) })
  .merge(settingsDataModelFieldDateFormSchema);

const dateTimeFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.DateTime) })
  .merge(settingsDataModelFieldDateFormSchema);

const relationFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.Relation) })
  .merge(settingsDataModelFieldRelationFormSchema);

const selectFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.Select) })
  .merge(settingsDataModelFieldSelectFormSchema);

const multiSelectFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.MultiSelect) })
  .merge(settingsDataModelFieldMultiSelectFormSchema);

const numberFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.Number) })
  .merge(settingsDataModelFieldNumberFormSchema);

const otherFieldsFormSchema = z.object({
  type: z.enum(
    Object.keys(
      omit(SETTINGS_FIELD_TYPE_CONFIGS, [
        FieldMetadataType.Boolean,
        FieldMetadataType.Currency,
        FieldMetadataType.Relation,
        FieldMetadataType.Select,
        FieldMetadataType.MultiSelect,
        FieldMetadataType.Date,
        FieldMetadataType.DateTime,
        FieldMetadataType.Number,
      ]),
    ) as [FieldMetadataType, ...FieldMetadataType[]],
  ),
});

export const settingsDataModelFieldSettingsFormSchema = z.discriminatedUnion(
  'type',
  [
    booleanFieldFormSchema,
    currencyFieldFormSchema,
    dateFieldFormSchema,
    dateTimeFieldFormSchema,
    relationFieldFormSchema,
    selectFieldFormSchema,
    multiSelectFieldFormSchema,
    numberFieldFormSchema,
    otherFieldsFormSchema,
  ],
);

type SettingsDataModelFieldSettingsFormCardProps = {
  isCreatingField?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'isCustom'
  > &
    Partial<Omit<FieldMetadataItem, 'icon' | 'label' | 'type'>>;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
`;

const previewableTypes = [
  FieldMetadataType.Array,
  FieldMetadataType.Address,
  FieldMetadataType.Boolean,
  FieldMetadataType.Currency,
  FieldMetadataType.Date,
  FieldMetadataType.DateTime,
  FieldMetadataType.Emails,
  FieldMetadataType.FullName,
  FieldMetadataType.Links,
  FieldMetadataType.MultiSelect,
  FieldMetadataType.Number,
  FieldMetadataType.Phones,
  FieldMetadataType.Rating,
  FieldMetadataType.RawJson,
  FieldMetadataType.Relation,
  FieldMetadataType.Select,
  FieldMetadataType.Text,
];

export const SettingsDataModelFieldSettingsFormCard = ({
  isCreatingField,
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldSettingsFormCardProps) => {
  if (!previewableTypes.includes(fieldMetadataItem.type)) {
    return null;
  }

  if (fieldMetadataItem.type === FieldMetadataType.Boolean) {
    return (
      <SettingsDataModelFieldBooleanSettingsFormCard
        fieldMetadataItem={fieldMetadataItem}
        objectMetadataItem={objectMetadataItem}
      />
    );
  }

  if (fieldMetadataItem.type === FieldMetadataType.Currency) {
    return (
      <SettingsDataModelFieldCurrencySettingsFormCard
        disabled={!isCreatingField}
        fieldMetadataItem={fieldMetadataItem}
        objectMetadataItem={objectMetadataItem}
      />
    );
  }

  if (
    fieldMetadataItem.type === FieldMetadataType.Date ||
    fieldMetadataItem.type === FieldMetadataType.DateTime
  ) {
    return (
      <SettingsDataModelFieldDateSettingsFormCard
        disabled={!isCreatingField}
        fieldMetadataItem={fieldMetadataItem}
        objectMetadataItem={objectMetadataItem}
      />
    );
  }

  if (fieldMetadataItem.type === FieldMetadataType.Relation) {
    return (
      <SettingsDataModelFieldRelationSettingsFormCard
        fieldMetadataItem={fieldMetadataItem}
        objectMetadataItem={objectMetadataItem}
      />
    );
  }

  if (fieldMetadataItem.type === FieldMetadataType.Number) {
    return (
      <SettingsDataModelFieldNumberSettingsFormCard
        disabled={fieldMetadataItem.isCustom === false}
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
    />
  );
};
