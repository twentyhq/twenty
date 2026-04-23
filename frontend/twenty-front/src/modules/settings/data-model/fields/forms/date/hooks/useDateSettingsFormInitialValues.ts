import { useFormContext } from 'react-hook-form';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type SettingsDataModelFieldDateFormValues } from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';

type UseDateSettingsFormInitialValuesProps = {
  fieldMetadataId: string;
};

export const useDateSettingsFormInitialValues = ({
  fieldMetadataId,
}: UseDateSettingsFormInitialValuesProps) => {
  const { fieldMetadataItem } = useFieldMetadataItemById(fieldMetadataId);

  const initialDisplayFormat =
    (fieldMetadataItem?.settings?.displayFormat as FieldDateDisplayFormat) ??
    FieldDateDisplayFormat.USER_SETTINGS;
  const initialCustomUnicodeDateFormat =
    (fieldMetadataItem?.settings?.customUnicodeDateFormat as string) ?? '';

  const { resetField } = useFormContext<SettingsDataModelFieldDateFormValues>();

  const resetDefaultValueField = () =>
    resetField('settings', {
      defaultValue: {
        displayFormat: initialDisplayFormat,
        customUnicodeDateFormat: initialCustomUnicodeDateFormat,
      },
    });

  return {
    initialDisplayFormat,
    initialCustomUnicodeDateFormat,
    resetDefaultValueField,
  };
};
