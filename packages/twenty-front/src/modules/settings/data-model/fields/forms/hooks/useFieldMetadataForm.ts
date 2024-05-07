import { useState } from 'react';
import { DeepPartial } from 'react-hook-form';
import { v4 } from 'uuid';
import { z } from 'zod';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { themeColorSchema } from '@/ui/theme/utils/themeColorSchema';
import {
  FieldMetadataType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { SettingsDataModelFieldSettingsFormValues } from '../components/SettingsDataModelFieldSettingsFormCard';

type FormValues = {
  defaultValue: any;
  type: SettingsSupportedFieldType;
} & SettingsDataModelFieldSettingsFormValues;

export const fieldMetadataFormDefaultValues: FormValues = {
  type: FieldMetadataType.Text,
  currency: { currencyCode: CurrencyCode.USD },
  relation: {
    type: RelationMetadataType.OneToMany,
    objectMetadataId: '',
    field: { label: '' },
  },
  defaultValue: null,
  select: [{ color: 'green', label: 'Option 1', value: v4() }],
  multiSelect: [{ color: 'green', label: 'Option 1', value: v4() }],
};
const relationTargetFieldSchema = z.object({
  description: z.string().optional(),
  icon: z.string().startsWith('Icon'),
  label: z.string().min(1),
  defaultValue: z.any(),
});
const fieldSchema = z.object({
  defaultValue: z.any(),
  type: z.enum(
    Object.values(FieldMetadataType) as [
      FieldMetadataType,
      ...FieldMetadataType[],
    ],
  ),
});

const currencySchema = fieldSchema.merge(
  z.object({
    type: z.literal(FieldMetadataType.Currency),
    currency: z.object({
      currencyCode: z.nativeEnum(CurrencyCode),
    }),
  }),
);

const relationSchema = fieldSchema.merge(
  z.object({
    type: z.literal(FieldMetadataType.Relation),
    relation: z.object({
      field: relationTargetFieldSchema,
      objectMetadataId: z.string().uuid(),
      type: z.enum([
        RelationMetadataType.OneToMany,
        RelationMetadataType.OneToOne,
        'MANY_TO_ONE',
      ]),
    }),
  }),
);

const selectSchema = fieldSchema.merge(
  z.object({
    type: z.literal(FieldMetadataType.Select),
    select: z
      .array(
        z.object({
          color: themeColorSchema,
          id: z.string().optional(),
          isDefault: z.boolean().optional(),
          label: z.string().min(1),
        }),
      )
      .nonempty(),
  }),
);

const multiSelectSchema = fieldSchema.merge(
  z.object({
    type: z.literal(FieldMetadataType.MultiSelect),
    multiSelect: z
      .array(
        z.object({
          color: themeColorSchema,
          id: z.string().optional(),
          isDefault: z.boolean().optional(),
          label: z.string().min(1),
        }),
      )
      .nonempty(),
  }),
);

const {
  Currency: _Currency,
  Relation: _Relation,
  Select: _Select,
  MultiSelect: _MultiSelect,
  ...otherFieldTypes
} = FieldMetadataType;

type OtherFieldType = Exclude<
  FieldMetadataType,
  | FieldMetadataType.Currency
  | FieldMetadataType.Relation
  | FieldMetadataType.Select
  | FieldMetadataType.MultiSelect
>;

const otherFieldTypesSchema = fieldSchema.merge(
  z.object({
    type: z.enum(
      Object.values(otherFieldTypes) as [OtherFieldType, ...OtherFieldType[]],
    ),
  }),
);

const schema = z.discriminatedUnion('type', [
  currencySchema,
  relationSchema,
  selectSchema,
  multiSelectSchema,
  otherFieldTypesSchema,
]);

type PartialFormValues = Partial<Omit<FormValues, 'relation'>> &
  DeepPartial<Pick<FormValues, 'relation'>>;

export const useFieldMetadataForm = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState<FormValues>(
    fieldMetadataFormDefaultValues,
  );
  const [formValues, setFormValues] = useState<FormValues>(
    fieldMetadataFormDefaultValues,
  );
  const [hasFieldFormChanged, setHasFieldFormChanged] = useState(false);
  const [hasCurrencyFormChanged, setHasCurrencyFormChanged] = useState(false);
  const [hasRelationFormChanged, setHasRelationFormChanged] = useState(false);
  const [hasSelectFormChanged, setHasSelectFormChanged] = useState(false);
  const [hasMultiSelectFormChanged, setHasMultiSelectFormChanged] =
    useState(false);
  const [hasDefaultValueChanged, setHasDefaultValueFormChanged] =
    useState(false);
  const [validationResult, setValidationResult] = useState(
    schema.safeParse(formValues),
  );

  const mergePartialValues = (
    previousValues: FormValues,
    nextValues: PartialFormValues,
  ): FormValues => ({
    ...previousValues,
    ...nextValues,
    currency: { ...previousValues.currency, ...nextValues.currency },
    relation: {
      ...previousValues.relation,
      ...nextValues.relation,
      field: {
        ...previousValues.relation?.field,
        ...nextValues.relation?.field,
      },
    },
  });

  const initForm = (lazyInitialFormValues: PartialFormValues) => {
    if (isInitialized) return;

    const mergedFormValues = mergePartialValues(
      initialFormValues,
      lazyInitialFormValues,
    );

    setInitialFormValues(mergedFormValues);
    setFormValues(mergedFormValues);
    setValidationResult(schema.safeParse(mergedFormValues));
    setIsInitialized(true);
  };

  const handleFormChange = (values: PartialFormValues) => {
    const nextFormValues = mergePartialValues(formValues, values);

    setFormValues(nextFormValues);
    setValidationResult(schema.safeParse(nextFormValues));

    const {
      currency: initialCurrencyFormValues,
      relation: initialRelationFormValues,
      select: initialSelectFormValues,
      multiSelect: initialMultiSelectFormValues,
      defaultValue: initialDefaultValue,
      ...initialFieldFormValues
    } = initialFormValues;
    const {
      currency: nextCurrencyFormValues,
      relation: nextRelationFormValues,
      select: nextSelectFormValues,
      multiSelect: nextMultiSelectFormValues,
      defaultValue: nextDefaultValue,
      ...nextFieldFormValues
    } = nextFormValues;

    setHasFieldFormChanged(
      !isDeeplyEqual(initialFieldFormValues, nextFieldFormValues),
    );
    setHasCurrencyFormChanged(
      nextFieldFormValues.type === FieldMetadataType.Currency &&
        !isDeeplyEqual(initialCurrencyFormValues, nextCurrencyFormValues),
    );
    setHasRelationFormChanged(
      nextFieldFormValues.type === FieldMetadataType.Relation &&
        !isDeeplyEqual(initialRelationFormValues, nextRelationFormValues),
    );
    setHasSelectFormChanged(
      nextFieldFormValues.type === FieldMetadataType.Select &&
        !isDeeplyEqual(initialSelectFormValues, nextSelectFormValues),
    );
    setHasMultiSelectFormChanged(
      nextFieldFormValues.type === FieldMetadataType.MultiSelect &&
        !isDeeplyEqual(initialMultiSelectFormValues, nextMultiSelectFormValues),
    );
    setHasDefaultValueFormChanged(
      nextFieldFormValues.type === FieldMetadataType.Boolean &&
        !isDeeplyEqual(initialDefaultValue, nextDefaultValue),
    );
  };

  return {
    formValues,
    handleFormChange,
    hasFieldFormChanged,
    hasFormChanged:
      hasFieldFormChanged ||
      hasCurrencyFormChanged ||
      hasRelationFormChanged ||
      hasSelectFormChanged ||
      hasMultiSelectFormChanged ||
      hasDefaultValueChanged,
    hasRelationFormChanged,
    hasSelectFormChanged,
    hasMultiSelectFormChanged,
    hasDefaultValueChanged,
    initForm,
    isInitialized,
    isValid: validationResult.success,
    validatedFormValues: validationResult.success
      ? validationResult.data
      : undefined,
  };
};
