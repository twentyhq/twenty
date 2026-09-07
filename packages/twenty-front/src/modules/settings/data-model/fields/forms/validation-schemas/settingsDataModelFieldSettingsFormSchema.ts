import omit from 'lodash.omit';
import { z } from 'zod';

import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { settingsDataModelFieldAddressFormSchema } from '@/settings/data-model/fields/forms/address/components/SettingsDataModelFieldAddressForm';
import { settingsDataModelFieldBooleanFormSchema } from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanForm';
import { settingsDataModelFieldTextFormSchema } from '@/settings/data-model/fields/forms/components/text/SettingsDataModelFieldTextForm';
import { settingsDataModelFieldCurrencyFormSchema } from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencyForm';
import { settingsDataModelFieldDateFormSchema } from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';
import { settingsDataModelFieldMorphRelationFormSchema } from '@/settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldRelationForm';
import { settingsDataModelFieldNumberFormSchema } from '@/settings/data-model/fields/forms/number/components/SettingsDataModelFieldNumberForm';
import { settingsDataModelFieldPhonesFormSchema } from '@/settings/data-model/fields/forms/phones/components/SettingsDataModelFieldPhonesForm';
import {
  settingsDataModelFieldMultiSelectFormSchema,
  settingsDataModelFieldSelectFormSchema,
} from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectForm';
import { mergeSettingsSchemas } from '@/settings/data-model/fields/forms/utils/mergeSettingsSchema';
import { settingsDataModelFieldLinksVariantSchema } from '@/settings/data-model/fields/forms/utils/settingsDataModelFieldLinksVariantSchema';
import { settingsDataModelFieldMaxValuesSchema } from '@/settings/data-model/fields/forms/utils/settingsDataModelFieldMaxValuesSchema';
import { settingsDataModelFieldOnClickActionSchema } from '@/settings/data-model/fields/forms/utils/settingsDataModelFieldOnClickActionSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';

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
  .object({
    type: z.literal(FieldMetadataType.RELATION),
  })
  .extend(settingsDataModelFieldMorphRelationFormSchema.shape);

const morphRelationFieldFormSchema = z
  .object({
    type: z.literal(FieldMetadataType.MORPH_RELATION),
  })
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

const emailsFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.EMAILS) })
  .merge(
    mergeSettingsSchemas(
      settingsDataModelFieldMaxValuesSchema,
      settingsDataModelFieldOnClickActionSchema,
    ),
  )
  .extend(isUniqueFieldFormSchema.shape);

const linksFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.LINKS) })
  .merge(
    mergeSettingsSchemas(
      settingsDataModelFieldMaxValuesSchema,
      settingsDataModelFieldOnClickActionSchema,
      settingsDataModelFieldLinksVariantSchema,
    ),
  )
  .extend(isUniqueFieldFormSchema.shape);

const arrayFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.ARRAY) })
  .merge(mergeSettingsSchemas(settingsDataModelFieldMaxValuesSchema))
  .extend(isUniqueFieldFormSchema.shape);

const filesFieldFormSchema = z
  .object({ type: z.literal(FieldMetadataType.FILES) })
  .merge(mergeSettingsSchemas(settingsDataModelFieldMaxValuesSchema));

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
          FieldMetadataType.EMAILS,
          FieldMetadataType.LINKS,
          FieldMetadataType.ARRAY,
          FieldMetadataType.FILES,
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
    emailsFieldFormSchema,
    linksFieldFormSchema,
    arrayFieldFormSchema,
    filesFieldFormSchema,
    otherFieldsFormSchema,
  ],
);
