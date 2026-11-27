import { useFormContext } from 'react-hook-form';

import { SettingsPreviewCard } from '@/settings/components/SettingsPreviewCard';
import {
  SettingsDataModelFieldCurrencyForm,
  type SettingsDataModelFieldCurrencyFormValues,
} from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencyForm';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { FieldMetadataType } from 'twenty-shared/types';
import { type SettingsDataModelFieldEditFormValues } from '@/settings/data-model/types/SettingsDataModelFieldEditFormValues';

type SettingsDataModelFieldCurrencySettingsFormCardProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

export const SettingsDataModelFieldCurrencySettingsFormCard = ({
  disabled,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldCurrencySettingsFormCardProps) => {
  const { watch } = useFormContext<
    SettingsDataModelFieldCurrencyFormValues &
      SettingsDataModelFieldEditFormValues
  >();

  return (
    <SettingsPreviewCard
      preview={
        <SettingsDataModelFieldPreviewWidget
          fieldMetadataItem={{
            type: FieldMetadataType.CURRENCY,
            label: watch('label'),
            icon: watch('icon'),
            defaultValue: watch('defaultValue'),
            settings: watch('settings'),
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      content={
        <SettingsDataModelFieldCurrencyForm
          disabled={disabled}
          existingFieldMetadataId={existingFieldMetadataId}
        />
      }
    />
  );
};
