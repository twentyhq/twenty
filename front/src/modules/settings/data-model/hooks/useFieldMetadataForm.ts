import { useState } from 'react';
import { DeepPartial } from 'react-hook-form';
import { z } from 'zod';

import { mainColors, ThemeColor } from '@/ui/theme/constants/colors';
import {
  FieldMetadataType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { SettingsObjectFieldTypeSelectSectionFormValues } from '../components/SettingsObjectFieldTypeSelectSection';

type FormValues = {
  description?: string;
  icon: string;
  label: string;
  type: FieldMetadataType;
  relation: SettingsObjectFieldTypeSelectSectionFormValues['relation'];
  select: SettingsObjectFieldTypeSelectSectionFormValues['select'];
};

const defaultValues: FormValues = {
  icon: 'IconUsers',
  label: '',
  type: FieldMetadataType.Text,
  relation: {
    type: RelationMetadataType.OneToMany,
  },
  select: [{ color: 'green', text: 'Option 1' }],
};

const fieldSchema = z.object({
  description: z.string().optional(),
  icon: z.string().startsWith('Icon'),
  label: z.string().min(1),
});

const relationSchema = fieldSchema.merge(
  z.object({
    type: z.literal(FieldMetadataType.Relation),
    relation: z.object({
      field: fieldSchema,
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
    type: z.literal(FieldMetadataType.Enum),
    select: z
      .array(
        z.object({
          color: z.enum(
            Object.keys(mainColors) as [ThemeColor, ...ThemeColor[]],
          ),
          text: z.string().min(1),
        }),
      )
      .nonempty(),
  }),
);

const {
  Enum: _Enum,
  Relation: _Relation,
  ...otherFieldTypes
} = FieldMetadataType;

const otherFieldTypesSchema = fieldSchema.merge(
  z.object({
    type: z.enum(
      Object.values(otherFieldTypes) as [
        Exclude<FieldMetadataType, FieldMetadataType.Relation>,
        ...Exclude<FieldMetadataType, FieldMetadataType.Relation>[],
      ],
    ),
  }),
);

const schema = z.discriminatedUnion('type', [
  relationSchema,
  selectSchema,
  otherFieldTypesSchema,
]);

type PartialFormValues = Partial<FormValues> &
  DeepPartial<Pick<FormValues, 'relation'>>;

export const useFieldMetadataForm = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialFormValues, setInitialFormValues] =
    useState<FormValues>(defaultValues);
  const [formValues, setFormValues] = useState<FormValues>(defaultValues);
  const [hasFieldFormChanged, setHasFieldFormChanged] = useState(false);
  const [hasRelationFormChanged, setHasRelationFormChanged] = useState(false);
  const [hasSelectFormChanged, setHasSelectFormChanged] = useState(false);
  const [validationResult, setValidationResult] = useState(
    schema.safeParse(formValues),
  );

  const mergePartialValues = (
    previousValues: FormValues,
    nextValues: PartialFormValues,
  ): FormValues => ({
    ...previousValues,
    ...nextValues,
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
      relation: initialRelationFormValues,
      select: initialSelectFormValues,
      ...initialFieldFormValues
    } = initialFormValues;
    const {
      relation: nextRelationFormValues,
      select: nextSelectFormValues,
      ...nextFieldFormValues
    } = nextFormValues;

    setHasFieldFormChanged(
      !isDeeplyEqual(initialFieldFormValues, nextFieldFormValues),
    );
    setHasRelationFormChanged(
      nextFieldFormValues.type === FieldMetadataType.Relation &&
        !isDeeplyEqual(initialRelationFormValues, nextRelationFormValues),
    );
    setHasSelectFormChanged(
      nextFieldFormValues.type === FieldMetadataType.Enum &&
        !isDeeplyEqual(initialSelectFormValues, nextSelectFormValues),
    );
  };

  return {
    formValues,
    handleFormChange,
    hasFieldFormChanged,
    hasFormChanged:
      hasFieldFormChanged || hasRelationFormChanged || hasSelectFormChanged,
    hasRelationFormChanged,
    initForm,
    isInitialized,
    isValid: validationResult.success,
    validatedFormValues: validationResult.success
      ? validationResult.data
      : undefined,
  };
};
