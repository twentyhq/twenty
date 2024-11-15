import { Controller, useFormContext } from 'react-hook-form';
import { IconCheck, IconX } from 'twenty-ui';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useBooleanSettingsFormInitialValues } from '@/settings/data-model/fields/forms/boolean/hooks/useBooleanSettingsFormInitialValues';
import { isDefined } from '~/utils/isDefined';

export const settingsDataModelFieldBooleanFormSchema = z.object({
  defaultValue: z.boolean(),
});

export type SettingsDataModelFieldBooleanFormValues = z.infer<
  typeof settingsDataModelFieldBooleanFormSchema
>;

type SettingsDataModelFieldBooleanFormProps = {
  className?: string;
  fieldMetadataItem: Pick<FieldMetadataItem, 'defaultValue'>;
};

export const SettingsDataModelFieldBooleanForm = ({
  className,
  fieldMetadataItem,
}: SettingsDataModelFieldBooleanFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldBooleanFormValues>();

  const isEditMode = isDefined(fieldMetadataItem?.defaultValue);
  const { initialDefaultValue } = useBooleanSettingsFormInitialValues({
    fieldMetadataItem,
  });

  return (
    <Controller
      name="defaultValue"
      control={control}
      defaultValue={initialDefaultValue}
      render={({ field: { onChange, value } }) => (
        <SettingsOptionCardContentSelect
          Icon={IconCheck}
          title="Default Value"
          description="Select the default value for this boolean field"
          value={value}
          onChange={onChange}
          selectClassName={className}
          // TODO: temporary fix - disabling edition because after editing the defaultValue,
          // newly created records are not taking into account the updated defaultValue properly.
          disabled={isEditMode}
          dropdownId="object-field-default-value-select-boolean"
          options={[
            {
              value: true,
              label: 'True',
              Icon: IconCheck,
            },
            {
              value: false,
              label: 'False',
              Icon: IconX,
            },
          ]}
        />
      )}
    />
  );
};
