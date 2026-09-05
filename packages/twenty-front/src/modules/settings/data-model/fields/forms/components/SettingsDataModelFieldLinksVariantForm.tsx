import { Controller, useFormContext } from 'react-hook-form';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { type SettingsDataModelFieldLinksVariantFormValues } from '@/settings/data-model/fields/forms/utils/settingsDataModelFieldLinksVariantSchema';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import {
  type FieldLinksVariant,
  type FieldMetadataSettings,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { IconWorld } from 'twenty-ui/icon';

type SettingsDataModelFieldLinksVariantFormProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
};

const DEFAULT_LINKS_VARIANT: FieldLinksVariant = 'url';

export const SettingsDataModelFieldLinksVariantForm = ({
  disabled,
  existingFieldMetadataId,
}: SettingsDataModelFieldLinksVariantFormProps) => {
  const { t } = useLingui();
  const { control } =
    useFormContext<SettingsDataModelFieldLinksVariantFormValues>();

  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  const options = [
    { label: t`URL`, value: 'url' as const },
    { label: t`Domain`, value: 'domain' as const },
  ];

  const existingSettings =
    (fieldMetadataItem?.settings as FieldMetadataSettings<FieldMetadataType.LINKS>) ??
    {};

  return (
    <Controller
      name="settings"
      control={control}
      defaultValue={{
        ...existingSettings,
        type: existingSettings?.type ?? DEFAULT_LINKS_VARIANT,
      }}
      render={({ field: { value, onChange } }) => {
        const currentSettings = value ?? {};

        return (
          <SettingsOptionCardContentSelect
            Icon={IconWorld}
            title={t`Link content`}
            description={t`Store the full URL or just the domain`}
            disabled={disabled}
          >
            <Select<FieldLinksVariant>
              dropdownWidth={180}
              value={currentSettings.type ?? DEFAULT_LINKS_VARIANT}
              onChange={(newValue) =>
                onChange({
                  ...currentSettings,
                  type: newValue,
                })
              }
              disabled={disabled}
              dropdownId="field-links-variant-select"
              options={options}
              selectSizeVariant="small"
              withSearchInput={false}
            />
          </SettingsOptionCardContentSelect>
        );
      }}
    />
  );
};
