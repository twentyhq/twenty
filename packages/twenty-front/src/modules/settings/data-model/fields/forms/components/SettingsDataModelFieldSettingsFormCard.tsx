import omit from 'lodash.omit';
import { z } from 'zod';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { settingsDataModelFieldAddressFormSchema } from '@/settings/data-model/fields/forms/address/components/SettingsDataModelFieldAddressForm';
import { SettingsDataModelFieldAddressSettingsFormCard } from '@/settings/data-model/fields/forms/address/components/SettingsDataModelFieldAddressSettingsFormCard';
import { settingsDataModelFieldBooleanFormSchema } from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanForm';
import { SettingsDataModelFieldBooleanSettingsFormCard } from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanSettingsFormCard';
import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import { settingsDataModelFieldTextFormSchema } from '@/settings/data-model/fields/forms/components/text/SettingsDataModelFieldTextForm';
import { SettingsDataModelFieldTextSettingsFormCard } from '@/settings/data-model/fields/forms/components/text/SettingsDataModelFieldTextSettingsFormCard';
import { settingsDataModelFieldCurrencyFormSchema } from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencyForm';
import { SettingsDataModelFieldCurrencySettingsFormCard } from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencySettingsFormCard';
import { settingsDataModelFieldDateFormSchema } from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';
import { SettingsDataModelFieldDateSettingsFormCard } from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateSettingsFormCard';
import { settingsDataModelFieldMorphRelationFormSchema } from '@/settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldMorphRelationForm';

import { SettingsDataModelFieldMorphRelationFormCard } from '@/settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldMorphRelationFormCard';
import { settingsDataModelFieldNumberFormSchema } from '@/settings/data-model/fields/forms/number/components/SettingsDataModelFieldNumberForm';
import { SettingsDataModelFieldNumberSettingsFormCard } from '@/settings/data-model/fields/forms/number/components/SettingsDataModelFieldNumberSettingsFormCard';
import { settingsDataModelFieldPhonesFormSchema } from '@/settings/data-model/fields/forms/phones/components/SettingsDataModelFieldPhonesForm';
import { SettingsDataModelFieldPhonesSettingsFormCard } from '@/settings/data-model/fields/forms/phones/components/SettingsDataModelFieldPhonesSettingsFormCard';
import { settingsDataModelFieldRelationFormSchema } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationForm';
import { SettingsDataModelFieldRelationSettingsFormCard } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationSettingsFormCard';
import {
  settingsDataModelFieldMultiSelectFormSchema,
  settingsDataModelFieldSelectFormSchema,
} from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectForm';
import { SettingsDataModelFieldSelectSettingsFormCard } from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectSettingsFormCard';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

const isUniqueFieldFormSchema = z.object({
  isUnique: z.boolean().nullable().default(false),
});

const booleanFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.BOOLEAN) })
  .extend(settingsDataModelFieldBooleanFormSchema.shape);

const currencyFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.CURRENCY) })
  .extend(settingsDataModelFieldCurrencyFormSchema.shape);

const dateFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.DATE) })
  .extend(settingsDataModelFieldDateFormSchema.shape)
  .extend(isUniqueFieldFormSchema.shape);

const dateTimeFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.DATE_TIME) })
  .extend(settingsDataModelFieldDateFormSchema.shape)
  .extend(isUniqueFieldFormSchema.shape);

const relationFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.RELATION) })
  .extend(settingsDataModelFieldRelationFormSchema.shape);

const morphRelationFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.MORPH_RELATION) })
  .extend(settingsDataModelFieldMorphRelationFormSchema.shape);

const selectFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.SELECT) })
  .extend(settingsDataModelFieldSelectFormSchema.shape);

const multiSelectFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.MULTI_SELECT) })
  .extend(settingsDataModelFieldMultiSelectFormSchema.shape);

const numberFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.NUMBER) })
  .extend(settingsDataModelFieldNumberFormSchema.shape)
  .extend(isUniqueFieldFormSchema.shape);

const textFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.TEXT) })
  .extend(settingsDataModelFieldTextFormSchema.shape)
  .extend(isUniqueFieldFormSchema.shape);

const addressFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.ADDRESS) })
  .extend(settingsDataModelFieldAddressFormSchema.shape);

const phonesFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.PHONES) })
  .extend(settingsDataModelFieldPhonesFormSchema.shape)
  .extend(isUniqueFieldFormSchema.shape);

const otherFieldsFormSchema = z
  .object({
    type: z.enum(
      Object.keys(
        omit(SETTINGS_FIELD_TYPE_CONFIGS, [
          FieldMetadataType.BOOLEAN,
          FieldMetadataType.CURRENCY,
          FieldMetadataType.RELATION,
          FieldMetadataType.MORPH_RELATION,
          FieldMetadataType.SELECT,
          FieldMetadataType.MULTI_SELECT,
          FieldMetadataType.DATE,
          FieldMetadataType.DATE_TIME,
          FieldMetadataType.NUMBER,
          FieldMetadataType.ADDRESS,
          FieldMetadataType.PHONES,
          FieldMetadataType.TEXT,
        ]),
      ) as [FieldMetadataType, ...FieldMetadataType[]],
    ),
  })
  .extend(isUniqueFieldFormSchema.shape);

export const settingsDataModelFieldSettingsFormSchema = z.discriminatedUnion(
  'type',
  [
    booleanFieldFormSchema,
    currencyFieldFormSchema,
    dateFieldFormSchema,
    dateTimeFieldFormSchema,
    relationFieldFormSchema,
    morphRelationFieldFormSchema,
    selectFieldFormSchema,
    multiSelectFieldFormSchema,
    numberFieldFormSchema,
    textFieldFormSchema,
    addressFieldFormSchema,
    phonesFieldFormSchema,
    otherFieldsFormSchema,
  ],
);

type SettingsDataModelFieldSettingsFormCardProps = {
  existingFieldMetadataId: string;
  fieldType: FieldMetadataType;
  objectNameSingular: string;
};

const previewableTypes = [
  FieldMetadataType.ARRAY,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.EMAILS,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.LINKS,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.PHONES,
  FieldMetadataType.RATING,
  FieldMetadataType.RAW_JSON,
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
  FieldMetadataType.SELECT,
  FieldMetadataType.TEXT,
  FieldMetadataType.UUID,
];

export const SettingsDataModelFieldSettingsFormCard = ({
  existingFieldMetadataId,
  fieldType,
  objectNameSingular,
}: SettingsDataModelFieldSettingsFormCardProps) => {
  const { watch } = useFormContext<SettingsDataModelFieldEditFormValues>();

  if (!previewableTypes.includes(fieldType)) {
    return null;
  }

  if (fieldType === FieldMetadataType.BOOLEAN) {
    return (
      <SettingsDataModelFieldBooleanSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
      />
    );
  }

  if (fieldType === FieldMetadataType.CURRENCY) {
    return (
      <SettingsDataModelFieldCurrencySettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
      />
    );
  }

  if (
    fieldType === FieldMetadataType.DATE ||
    fieldType === FieldMetadataType.DATE_TIME
  ) {
    return (
      <SettingsDataModelFieldDateSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        fieldType={fieldType}
        objectNameSingular={objectNameSingular}
      />
    );
  }

  if (fieldType === FieldMetadataType.RELATION) {
    return (
      <SettingsDataModelFieldRelationSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
      />
    );
  }

  if (fieldType === FieldMetadataType.MORPH_RELATION) {
    return (
      <SettingsDataModelFieldMorphRelationFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
      />
    );
  }

  if (fieldType === FieldMetadataType.NUMBER) {
    return (
      <SettingsDataModelFieldNumberSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
      />
    );
  }

  if (fieldType === FieldMetadataType.TEXT) {
    return (
      <SettingsDataModelFieldTextSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
      />
    );
  }

  if (fieldType === FieldMetadataType.ADDRESS) {
    return (
      <SettingsDataModelFieldAddressSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
      />
    );
  }

  if (fieldType === FieldMetadataType.PHONES) {
    return (
      <SettingsDataModelFieldPhonesSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
      />
    );
  }

  if (
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT
  ) {
    return (
      <SettingsDataModelFieldSelectSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        fieldType={fieldType}
        objectNameSingular={objectNameSingular}
      />
    );
  }

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <SettingsDataModelFieldPreviewWidget
          fieldMetadataItem={{
            type: fieldType,
            label: watch('label'),
            icon: watch('icon'),
            defaultValue: watch('defaultValue'),
            settings: watch('settings'),
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      form={
        <SettingsDataModelFieldIsUniqueForm
          fieldType={fieldType}
          existingFieldMetadataId={existingFieldMetadataId}
          objectNameSingular={objectNameSingular}
        />
      }
    />
  );
};
