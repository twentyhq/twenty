import { SettingsPreviewCard } from '@/settings/components/SettingsPreviewCard';
import {
  SettingsDataModelFieldAddressForm,
  type SettingsDataModelFieldTextFormValues,
} from '@/settings/data-model/fields/forms/address/components/SettingsDataModelFieldAddressForm';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { type SettingsDataModelFieldEditFormValues } from '@/settings/data-model/types/SettingsDataModelFieldEditFormValues';

type SettingsDataModelFieldAddressSettingsFormCardProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

export const SettingsDataModelFieldAddressSettingsFormCard = ({
  disabled,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldAddressSettingsFormCardProps) => {
  const { watch } = useFormContext<
    SettingsDataModelFieldTextFormValues & SettingsDataModelFieldEditFormValues
  >();
  return (
    <SettingsPreviewCard
      preview={
        <SettingsDataModelFieldPreviewWidget
          fieldMetadataItem={{
            icon: watch('icon'),
            label: watch('label'),
            type: FieldMetadataType.ADDRESS,
            settings: {
              subFields: watch('settings.subFields'),
            },
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      content={
        <SettingsDataModelFieldAddressForm
          disabled={disabled}
          existingFieldMetadataId={existingFieldMetadataId}
        />
      }
    />
  );
};
