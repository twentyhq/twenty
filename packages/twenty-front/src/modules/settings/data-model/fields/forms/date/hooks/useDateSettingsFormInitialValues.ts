import { useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldDateDisplayFormat } from '@/object-record/record-field/types/FieldMetadata';
import { SettingsDataModelFieldDateFormValues } from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';

export const useDateSettingsFormInitialValues = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'settings'>;
}) => {
  const initialDisplayFormat = fieldMetadataItem?.settings
    ?.displayFormat as FieldDateDisplayFormat;
  const initialCustomUnicode35DateFormat = fieldMetadataItem?.settings
    ?.customUnicode35DateFormat as string;

  const { resetField } = useFormContext<SettingsDataModelFieldDateFormValues>();

  const resetDefaultValueField = () =>
    resetField('settings.displayFormat', {
      defaultValue: initialDisplayFormat,
    });

  return {
    initialDisplayFormat,
    initialCustomUnicode35DateFormat,
    resetDefaultValueField,
  };
};
