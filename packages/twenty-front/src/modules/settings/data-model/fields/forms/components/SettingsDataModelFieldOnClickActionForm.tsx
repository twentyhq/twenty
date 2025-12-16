import { Controller, useFormContext } from 'react-hook-form';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { getSettingsDataModelFieldOnClickActionDescription } from '@/settings/data-model/fields/forms/utils/getSettingsDataModelFieldOnClickActionDescription.util';
import { type SettingsDataModelFieldOnClickActionFormValues } from '@/settings/data-model/fields/forms/utils/settingsDataModelFieldOnClickActionSchema';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import {
  type FieldMetadataMultiItemSettings,
  FieldMetadataSettingsOnClickAction,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { IconClick } from 'twenty-ui/display';

type SettingsDataModelFieldOnClickActionFormProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  fieldType:
    | FieldMetadataType.PHONES
    | FieldMetadataType.EMAILS
    | FieldMetadataType.LINKS;
};

export const SettingsDataModelFieldOnClickActionForm = ({
  disabled,
  existingFieldMetadataId,
  fieldType,
}: SettingsDataModelFieldOnClickActionFormProps) => {
  const { t } = useLingui();
  const { control } =
    useFormContext<SettingsDataModelFieldOnClickActionFormValues>();

  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  const options = [
    {
      label: t`Open as link`,
      value: FieldMetadataSettingsOnClickAction.OPEN_LINK,
    },
    {
      label: t`Copy to clipboard`,
      value: FieldMetadataSettingsOnClickAction.COPY,
    },
  ];

  const description =
    getSettingsDataModelFieldOnClickActionDescription(fieldType);

  const existingSettings =
    (fieldMetadataItem?.settings as FieldMetadataMultiItemSettings) ?? {};

  return (
    <Controller
      name="settings"
      control={control}
      defaultValue={{
        ...existingSettings,
        clickAction:
          existingSettings.clickAction ??
          FieldMetadataSettingsOnClickAction.OPEN_LINK,
      }}
      render={({ field: { value, onChange } }) => {
        const currentSettings =
          (value as FieldMetadataMultiItemSettings | undefined) ?? {};

        const clickAction =
          currentSettings.clickAction ??
          FieldMetadataSettingsOnClickAction.OPEN_LINK;

        return (
          <SettingsOptionCardContentSelect
            Icon={IconClick}
            title={t`Action on click`}
            description={description}
            disabled={disabled}
          >
            <Select<FieldMetadataSettingsOnClickAction>
              dropdownWidth={180}
              value={clickAction}
              onChange={(newValue) =>
                onChange({
                  ...currentSettings,
                  clickAction: newValue,
                })
              }
              disabled={disabled}
              dropdownId="field-click-behavior-select"
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
