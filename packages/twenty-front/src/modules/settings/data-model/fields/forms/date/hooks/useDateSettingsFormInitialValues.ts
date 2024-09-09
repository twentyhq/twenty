import { useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelFieldDateFormValues } from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';

export const useDateSettingsFormInitialValues = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'settings'>;
}) => {
  const initialDisplayAsRelativeDateValue =
    fieldMetadataItem?.settings?.displayAsRelativeDate;

  const { resetField } = useFormContext<SettingsDataModelFieldDateFormValues>();

  const resetDefaultValueField = () =>
    resetField('settings.displayAsRelativeDate', {
      defaultValue: initialDisplayAsRelativeDateValue,
    });

  return {
    initialDisplayAsRelativeDateValue,
    resetDefaultValueField,
  };
};
