import { Controller, useFormContext } from 'react-hook-form';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { type SettingsDataModelFieldClickBehaviorFormValues } from '@/settings/data-model/fields/forms/utils/settingsDataModelFieldClickBehaviorSchema';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import {
  FieldClickAction,
  type FieldMetadataMultiItemSettings,
  FieldMetadataType,
} from 'twenty-shared/types';
import { IconClick } from 'twenty-ui/display';

type SettingsDataModelFieldClickBehaviorFormProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  fieldType: FieldMetadataType;
};

export const SettingsDataModelFieldClickBehaviorForm = ({
  disabled,
  existingFieldMetadataId,
  fieldType,
}: SettingsDataModelFieldClickBehaviorFormProps) => {
  const { t } = useLingui();
  const { control } =
    useFormContext<SettingsDataModelFieldClickBehaviorFormValues>();

  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  let title: string;
  let description: string;
  let defaultValue: FieldClickAction;
  const options: Array<{ label: string; value: FieldClickAction }> = [];

  switch (fieldType) {
    case FieldMetadataType.PHONES:
      title = t`Click Behavior`;
      description = t`Choose what happens when you click a phone number`;
      defaultValue = FieldClickAction.COPY;
      options.push(
        { label: t`Copy to clipboard`, value: FieldClickAction.COPY },
        { label: t`Open as link`, value: FieldClickAction.OPEN_LINK },
      );
      break;
    case FieldMetadataType.EMAILS:
      title = t`Click Behavior`;
      description = t`Choose what happens when you click an email`;
      defaultValue = FieldClickAction.OPEN_LINK;
      options.push(
        { label: t`Open as link`, value: FieldClickAction.OPEN_LINK },
        { label: t`Copy to clipboard`, value: FieldClickAction.COPY },
      );
      break;
    case FieldMetadataType.LINKS:
      title = t`Click Behavior`;
      description = t`Choose what happens when you click a link`;
      defaultValue = FieldClickAction.OPEN_LINK;
      options.push(
        { label: t`Open as link`, value: FieldClickAction.OPEN_LINK },
        { label: t`Copy to clipboard`, value: FieldClickAction.COPY },
      );
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
        clickAction: existingSettings.clickAction ?? defaultValue,
      }}
      render={({ field: { value, onChange } }) => {
        const currentSettings =
          (value as FieldMetadataMultiItemSettings | undefined) ?? {};

        const clickAction = currentSettings.clickAction ?? defaultValue;

        return (
          <SettingsOptionCardContentSelect
            Icon={IconClick}
            title={title}
            description={description}
            disabled={disabled}
          >
            <Select<FieldClickAction>
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
