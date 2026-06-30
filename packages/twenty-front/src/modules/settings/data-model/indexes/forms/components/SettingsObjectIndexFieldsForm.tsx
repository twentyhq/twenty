import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { buildIndexableSelectOptions } from '@/settings/data-model/indexes/utils/buildIndexableSelectOptions';
import { decodeIndexableOptionValue } from '@/settings/data-model/indexes/utils/decodeIndexableOptionValue';
import { encodeIndexableOptionValue } from '@/settings/data-model/indexes/utils/encodeIndexableOptionValue';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { IconTrash, useIcons } from 'twenty-ui/icon';
import { IconButton, type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type SettingsObjectNewIndexFormValues } from '~/pages/settings/data-model/new-index/SettingsObjectNewIndexFormValues';

type SettingsObjectIndexFieldsFormProps = {
  indexableFields: FieldMetadataItem[];
};

const StyledFieldRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledSelectWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledPlaceholder = styled.div`
  height: ${themeCssVariables.spacing[8]};
  width: ${themeCssVariables.spacing[8]};
`;

export const SettingsObjectIndexFieldsForm = ({
  indexableFields,
}: SettingsObjectIndexFieldsFormProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { control } = useFormContext<SettingsObjectNewIndexFormValues>();

  const allOptions = useMemo(
    () => buildIndexableSelectOptions({ indexableFields, getIcon }),
    [indexableFields, getIcon],
  );

  const emptyFieldOption: SelectOption<string> = {
    label: t`Select a field`,
    value: '',
  };

  return (
    <Controller
      name="fields"
      control={control}
      render={({ field: { value, onChange } }) => {
        const rows: (
          | SettingsObjectNewIndexFormValues['fields'][number]
          | null
        )[] = [...value, null];

        const pickedValues = value.map((entry) =>
          encodeIndexableOptionValue(entry.fieldMetadataId, entry.subFieldName),
        );

        const handleSelect = (rowIndex: number, newOptionValue: string) => {
          if (newOptionValue === '') return;

          const next = [...value];
          const decoded = decodeIndexableOptionValue(newOptionValue);

          if (rowIndex < value.length) {
            next[rowIndex] = decoded;
          } else {
            next.push(decoded);
          }

          onChange(next);
        };

        const handleRemove = (rowIndex: number) => {
          onChange(value.filter((_, index) => index !== rowIndex));
        };

        return (
          <>
            {rows.map((entry, rowIndex) => {
              const currentValue = entry
                ? encodeIndexableOptionValue(
                    entry.fieldMetadataId,
                    entry.subFieldName,
                  )
                : '';

              const availableOptions = allOptions.filter(
                (option) =>
                  option.value === currentValue ||
                  !pickedValues.includes(option.value),
              );

              const isEmptyRow = entry === null;

              return (
                <StyledFieldRow key={`${rowIndex}-${currentValue || 'empty'}`}>
                  <StyledSelectWrapper>
                    <Select
                      dropdownId={`settings-object-new-index-field-${rowIndex}`}
                      value={currentValue}
                      options={availableOptions}
                      emptyOption={emptyFieldOption}
                      onChange={(newValue) => handleSelect(rowIndex, newValue)}
                      fullWidth
                      withSearchInput
                    />
                  </StyledSelectWrapper>
                  {isEmptyRow ? (
                    <StyledPlaceholder />
                  ) : (
                    <IconButton
                      Icon={IconTrash}
                      variant="tertiary"
                      size="medium"
                      onClick={() => handleRemove(rowIndex)}
                      ariaLabel={t`Remove field`}
                    />
                  )}
                </StyledFieldRow>
              );
            })}
          </>
        );
      }}
    />
  );
};
