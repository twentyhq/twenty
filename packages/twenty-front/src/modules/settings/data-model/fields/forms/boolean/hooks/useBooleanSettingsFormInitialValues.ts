import { useFormContext } from 'react-hook-form';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type SettingsDataModelFieldBooleanFormValues } from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanForm';

export const useBooleanSettingsFormInitialValues = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'defaultValue'>;
}) => {
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
