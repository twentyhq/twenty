import { useFormContext } from 'react-hook-form';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { type SettingsDataModelFieldBooleanFormValues } from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanForm';

type UseBooleanSettingsFormInitialValuesProps = {
  existingFieldMetadataId: string;
};

export const useBooleanSettingsFormInitialValues = ({
  existingFieldMetadataId,
}: UseBooleanSettingsFormInitialValuesProps) => {
  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  const initialDefaultValue =
    (fieldMetadataItem?.defaultValue as SettingsDataModelFieldBooleanFormValues['defaultValue']) ??
    true;

  const { resetField } =
    useFormContext<SettingsDataModelFieldBooleanFormValues>();

  const resetDefaultValueField = () => {
    resetField('defaultValue', { defaultValue: initialDefaultValue });
  };

  return {
    initialDefaultValue,
    resetDefaultValueField,
  };
};
