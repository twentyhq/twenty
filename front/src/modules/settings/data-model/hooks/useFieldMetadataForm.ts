import { useState } from 'react';
import { DeepPartial } from 'react-hook-form';
import { z } from 'zod';

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
};

const defaultValues: FormValues = {
  icon: 'IconUsers',
  label: '',
  type: FieldMetadataType.Text,
  relation: {
    type: RelationMetadataType.OneToMany,
  },
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

const { Relation: _, ...otherFieldTypes } = FieldMetadataType;

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
  otherFieldTypesSchema,
]);

export const useFieldMetadataForm = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialFormValues, setInitialFormValues] =
    useState<FormValues>(defaultValues);
  const [formValues, setFormValues] = useState<FormValues>(defaultValues);
  const [hasFieldFormChanged, setHasFieldFormChanged] = useState(false);
  const [hasRelationFormChanged, setHasRelationFormChanged] = useState(false);
  const [validationResult, setValidationResult] = useState(
    schema.safeParse(formValues),
  );

  const mergePartialValues = (
    previousValues: FormValues,
    nextValues: DeepPartial<FormValues>,
  ) => ({
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

  const initForm = (lazyInitialFormValues: DeepPartial<FormValues>) => {
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

  const handleFormChange = (values: DeepPartial<FormValues>) => {
    const nextFormValues = mergePartialValues(formValues, values);

    setFormValues(nextFormValues);
    setValidationResult(schema.safeParse(nextFormValues));

    const { relation: initialRelationFormValues, ...initialFieldFormValues } =
      initialFormValues;
    const { relation: nextRelationFormValues, ...nextFieldFormValues } =
      nextFormValues;

    setHasFieldFormChanged(
      !isDeeplyEqual(initialFieldFormValues, nextFieldFormValues),
    );
    setHasRelationFormChanged(
      nextFieldFormValues.type === FieldMetadataType.Relation &&
        !isDeeplyEqual(initialRelationFormValues, nextRelationFormValues),
    );
  };

  return {
    formValues,
    handleFormChange,
    hasFieldFormChanged,
    hasFormChanged: hasFieldFormChanged || hasRelationFormChanged,
    hasRelationFormChanged,
    initForm,
    isValid: validationResult.success,
    validatedFormValues: validationResult.success
      ? validationResult.data
      : undefined,
  };
};
