import { useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelFieldDateFormValues } from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';

export const useDateSettingsFormInitialValues = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'settings'>;
}) => {
  const initialDisplayFormat = fieldMetadataItem?.settings?.displayFormat;

  const { resetField } = useFormContext<SettingsDataModelFieldDateFormValues>();

  const resetDefaultValueField = () =>
    resetField('settings.displayFormat', {
      defaultValue: initialDisplayFormat,
    });

  return {
    initialDisplayFormat,
    resetDefaultValueField,
  };
};
