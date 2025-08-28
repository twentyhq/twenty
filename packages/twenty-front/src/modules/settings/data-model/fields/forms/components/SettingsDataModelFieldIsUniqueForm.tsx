import { Controller, useFormContext } from 'react-hook-form';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'isCustom' | 'settings' | 'isUnique'
  > &
    Partial<{ id: string }>;
  objectMetadataItem: Pick<ObjectMetadataItem, 'indexMetadatas'>;
};

export const SettingsDataModelFieldIsUniqueForm = ({
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldIsUniqueFormProps) => {
  const { control } =
    useFormContext<SettingsDataModelFieldIsUniqueFormValues>();

  const hasStandardUniqueIndex = objectMetadataItem.indexMetadatas.some(
    (index) =>
      index.isUnique &&
      !index.isCustom &&
      index.indexFieldMetadatas?.some(
        (field) => field.fieldMetadataId === fieldMetadataItem.id,
      ),
  );

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
              description={t`Prevent from assigning the same value to different records`}
            >
              <Toggle
                toggleSize="small"
                value={isUnique}
                onChange={(value) => onChange(value)}
                disabled={hasStandardUniqueIndex}
              />
            </SettingsOptionCardContentSelect>
          </>
        );
      }}
    />
  );
};
