import { Controller, useFormContext } from 'react-hook-form';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { Separator } from '@/settings/components/Separator';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { canBeUnique } from '@/settings/data-model/fields/forms/utils/canBeUnique.util';
import { t } from '@lingui/core/macro';
import { IconKey } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';

type SettingsDataModelFieldIsUniqueFormValues = {
  isUnique: boolean;
};

type SettingsDataModelFieldIsUniqueFormProps = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'isUnique' | 'type' | 'isCustom'>;
};

export const SettingsDataModelFieldIsUniqueForm = ({
  fieldMetadataItem,
}: SettingsDataModelFieldIsUniqueFormProps) => {
  const { control } =
    useFormContext<SettingsDataModelFieldIsUniqueFormValues>();

  if (!canBeUnique(fieldMetadataItem)) {
    return null;
  }

  return (
    <Controller
      name="isUnique"
      defaultValue={fieldMetadataItem?.isUnique || false}
      control={control}
      render={({ field: { onChange, value } }) => {
        const isUnique = value ?? false;

        return (
          <>
            <Separator />
            <SettingsOptionCardContentSelect
              Icon={IconKey}
              title={t`Unique`}
              description={t`Prevent from assigining the same value to different records`}
            >
              <Toggle
                toggleSize="small"
                value={isUnique}
                onChange={(value) => onChange(value)}
              />
            </SettingsOptionCardContentSelect>
          </>
        );
      }}
    />
  );
};
