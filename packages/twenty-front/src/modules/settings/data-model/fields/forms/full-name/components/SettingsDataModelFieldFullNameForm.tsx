import { Controller, useFormContext } from 'react-hook-form';
import {
  ALLOWED_FULL_NAME_SUBFIELDS,
  type AllowedFullNameSubField,
} from 'twenty-shared/types';
import { IconArrowsSort } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { z } from 'zod';

import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useFullNameSettingsFormInitialValues } from '@/settings/data-model/fields/forms/full-name/hooks/useFullNameSettingsFormInitialValues';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';

export const fullNameSettingsSchema = z.object({
  defaultSortSubField: z
    .enum(ALLOWED_FULL_NAME_SUBFIELDS)
    .optional()
    .nullable(),
});

export const settingsDataModelFieldFullNameFormSchema = z.object({
  settings: fullNameSettingsSchema,
});

export type SettingsDataModelFieldFullNameFormValues = z.infer<
  typeof settingsDataModelFieldFullNameFormSchema
>;

type SettingsDataModelFieldFullNameFormProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
};

export const SettingsDataModelFieldFullNameForm = ({
  disabled,
  existingFieldMetadataId,
}: SettingsDataModelFieldFullNameFormProps) => {
  const { t } = useLingui();
  const { control } =
    useFormContext<SettingsDataModelFieldFullNameFormValues>();
  const { initialDefaultSortSubField } = useFullNameSettingsFormInitialValues({
    existingFieldMetadataId,
  });

  const subFieldLabels: Record<AllowedFullNameSubField, string> = {
    firstName: t`First Name`,
    lastName: t`Last Name`,
  };

  const sortOptions: SelectOption<AllowedFullNameSubField>[] =
    ALLOWED_FULL_NAME_SUBFIELDS.map((subField) => ({
      label: subFieldLabels[subField],
      value: subField,
    }));

  return (
    <Controller
      name="settings.defaultSortSubField"
      defaultValue={initialDefaultSortSubField}
      control={control}
      render={({ field: { onChange, value } }) => (
        <SettingsOptionCardContentSelect
          Icon={IconArrowsSort}
          title={t`Default Sort Sub-Field`}
          description={t`Pick which sub-field is used when sorting this column`}
        >
          <Select<AllowedFullNameSubField>
            dropdownId="fullNameDefaultSortSubFieldId"
            disabled={disabled}
            value={value ?? initialDefaultSortSubField}
            onChange={onChange}
            options={sortOptions}
            selectSizeVariant="small"
          />
        </SettingsOptionCardContentSelect>
      )}
    />
  );
};
