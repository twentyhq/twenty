import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelFieldSelectRows } from '@/settings/data-model/components/SettingsDataModelFieldSelectRows';
import { buildIndexableSelectOptions } from '@/settings/data-model/indexes/utils/buildIndexableSelectOptions';
import { decodeIndexableOptionValue } from '@/settings/data-model/indexes/utils/decodeIndexableOptionValue';
import { encodeIndexableOptionValue } from '@/settings/data-model/indexes/utils/encodeIndexableOptionValue';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useIcons } from 'twenty-ui/icon';
import { type SettingsObjectNewIndexFormValues } from '~/pages/settings/data-model/new-index/SettingsObjectNewIndexFormValues';

type SettingsObjectIndexFieldsFormProps = {
  indexableFields: FieldMetadataItem[];
};

export const SettingsObjectIndexFieldsForm = ({
  indexableFields,
}: SettingsObjectIndexFieldsFormProps) => {
  const { getIcon } = useIcons();
  const { control } = useFormContext<SettingsObjectNewIndexFormValues>();

  const allOptions = useMemo(
    () => buildIndexableSelectOptions({ indexableFields, getIcon }),
    [indexableFields, getIcon],
  );

  return (
    <Controller
      name="fields"
      control={control}
      render={({ field: { value, onChange } }) => (
        <SettingsDataModelFieldSelectRows
          values={value.map((entry) =>
            encodeIndexableOptionValue(
              entry.fieldMetadataId,
              entry.subFieldName,
            ),
          )}
          options={allOptions}
          dropdownIdPrefix="settings-object-new-index-field"
          onChange={(nextValues) =>
            onChange(nextValues.map(decodeIndexableOptionValue))
          }
        />
      )}
    />
  );
};
