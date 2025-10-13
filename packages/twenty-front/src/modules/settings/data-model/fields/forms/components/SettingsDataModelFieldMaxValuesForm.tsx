import { Controller, useFormContext } from 'react-hook-form';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import { type SettingsDataModelFieldMaxValuesFormValues } from '@/settings/data-model/fields/forms/utils/settingsDataModelFieldMaxValuesSchema';
import { useLingui } from '@lingui/react/macro';
import {
  MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES,
  MULTI_ITEM_FIELD_MIN_MAX_VALUES,
} from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type FieldMetadataMultiItemSettings,
} from 'twenty-shared/types';
import { IconNumber } from 'twenty-ui/display';

type SettingsDataModelFieldMaxValuesFormProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  fieldType: FieldMetadataType;
};

export const SettingsDataModelFieldMaxValuesForm = ({
  disabled,
  existingFieldMetadataId,
  fieldType,
}: SettingsDataModelFieldMaxValuesFormProps) => {
  const { t } = useLingui();
  const { control } =
    useFormContext<SettingsDataModelFieldMaxValuesFormValues>();

  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  let title: string | undefined;
  let description: string | undefined;

  switch (fieldType) {
    case FieldMetadataType.PHONES:
      title = t`Maximum phone numbers`;
      description = t`Ability to add more than one phone number`;
      break;
    case FieldMetadataType.EMAILS:
      title = t`Maximum email addresses`;
      description = t`Ability to add more than one email address`;
      break;
    case FieldMetadataType.LINKS:
      title = t`Maximum URLs`;
      description = t`Ability to add more than one URL`;
      break;
    case FieldMetadataType.ARRAY:
      title = t`Maximum values`;
      description = t`Limit how many values can be added to this field`;
      break;
    default:
      return null;
  }

  const existingSettings =
    (fieldMetadataItem?.settings as FieldMetadataMultiItemSettings) ?? {};

  return (
    <Controller
      name="settings"
      control={control}
      defaultValue={{
        ...existingSettings,
        maxNumberOfValues:
          existingSettings.maxNumberOfValues ??
          MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES,
      }}
      render={({ field: { value, onChange } }) => {
        const currentSettings =
          (value as FieldMetadataMultiItemSettings | undefined) ?? {};

        const maxNumberOfValues =
          currentSettings.maxNumberOfValues ??
          MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

        return (
          <SettingsOptionCardContentCounter
            Icon={IconNumber}
            title={title}
            description={description}
            disabled={disabled}
            minValue={MULTI_ITEM_FIELD_MIN_MAX_VALUES}
            value={maxNumberOfValues}
            onChange={(newValue) =>
              onChange({
                ...currentSettings,
                maxNumberOfValues: newValue,
              })
            }
          />
        );
      }}
    />
  );
};
